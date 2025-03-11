/*
#[playbgm]

:group
オーディオ

:title
BGMの再生

:exp
BGMを再生します。再生する音声ファイルは`data/bgm`フォルダに配置します。

<b>`mp3`形式推奨</b>。`ogg``m4a``wav`形式にも対応します。

ただし、<b>`ogg`形式は一部のブラウザにおいて動作しません</b>（IE、Safari）。`ogg`形式を使う場合、IEとSafariにも対応させるためには、同じフォルダに同名の`m4a`ファイルを用意してください。そうした場合、IEやSafariでは自動で`m4a`形式のファイルが選択されるようになります。（ブラウザゲームとして公開しない場合は不要）

:sample
[playbgm storage=music.mp3]

:param
storage     = !!audio,
loop        = !!,
sprite_time = !!,
volume      = !!,
html5       = !!,
pause       = `true`を指定するとタグ実行時にBGMを再生しません。`[resumebgm]`で再生できます,
seek        = 再生開始時間を設定できます。例えば4.5と指定すると4.5秒進んだ位置からBGMが再生されます,
restart     = この`[playbgm]`で再生しようとしたBGMがすでに再生されていた場合の処理を設定できます。`true`なら最初から再生し直し、`false`なら無視となります。

#[end]
*/

//音楽再生
tyrano.plugin.kag.tag.playbgm = {
    vital: ["storage"],

    pm: {
        loop: "true",
        storage: "",
        fadein: "false",
        time: 2000,
        volume: "",
        buf: "0",
        target: "bgm", //"bgm" or "se"

        sprite_time: "", //200-544

        pause: "false",
        seek: "",

        html5: "false",

        click: "false", //音楽再生にクリックが必要か否か
        stop: "false", //trueの場合自動的に次の命令へ移動しない。ロード対策

        base64: "", //base64 対応
    },

    waitClick: function (pm) {
        // イベントレイヤを隠してクリックを待つ
        this.kag.weaklyStop();
        $(".tyrano_base").on("click.bgm", () => {
            this.kag.readyAudio();
            this.play(pm);
            $(".tyrano_base").off("click.bgm");
        });
    },

    start: function (pm) {
        // 次のタグに進むべきか
        // シナリオファイルに書かれた[playse][playbgm]などの場合は当然次のタグに進む必要があるが
        // ボタンのクリック効果音を鳴らす場合などにJSでタグ実行関数を直接叩く場合があり(例は以下)、その場合には次のタグに進めない
        // (TYRANO.kag.ftag.startTag("playse", { storage: "foo.mp3", stop: "true" }); // JSでタグを直接実行
        // この変数は is_tag_in_scenario と読み替えてもいい
        const should_next_order = pm.stop === "false";

        //
        // 音声ファイルの再生を一時的に無視する仕組み(現在未使用)
        //

        // BGMの再生が無効でこれがBGMなら無視
        if (pm.target == "bgm" && this.kag.stat.play_bgm === false) {
            if (should_next_order) this.kag.ftag.nextOrder();
            return;
        }

        // SEの再生が無効でこれがSEなら無視
        if (pm.target == "se" && this.kag.stat.play_se === false) {
            if (should_next_order) this.kag.ftag.nextOrder();
            return;
        }

        //
        // 音声の再生制限が解除されていない場合に、
        // いま実行しようとしているこの[playbgm]を無視していいかどうか
        //

        // 無視しちゃダメに決まってんだろ！
        let can_ignore_in_no_ready = false;
        // でもシナリオから呼ばれた[playbgm]じゃなくてJSで直接実行されたような[playbgm]は無視していいんじゃ？
        if (!should_next_order) {
            can_ignore_in_no_ready = true;
            // ただしセーブデータロード時の復元の[playbgm]は絶対に無視してはいけない！
            // ゲーム起動直後に[autoload]を実行して音声再生制限解除前にロードするケースを想定
            if (pm.can_ignore === "false") {
                // console.warn("can't ignore audio");
                can_ignore_in_no_ready = false;
            }
        }

        //
        // PCかスマホかで分岐
        //

        if ($.userenv() === "pc") {
            // PC環境
            if (this.kag.tmp.ready_audio) {
                // オーディオ再生制限解除済みなら再生
                this.play(pm);
            } else {
                // 未解除の場合
                // 無視できないやつならクリックを待つ
                if (!can_ignore_in_no_ready) this.waitClick(pm);
            }
        } else {
            // スマホ・タブレット環境
            if (this.kag.stat.is_skip && pm.target === "se") {
                // スキップ中のSEは無視して次にタグに進む(スマホの通信制限に配慮)
                if (should_next_order) this.kag.ftag.nextOrder();
            } else if (this.kag.tmp.ready_audio) {
                // オーディオ再生制限解除済みなら再生
                this.play(pm);
            } else {
                // 未解除の場合
                // 無視できないやつならクリックを待つ
                if (!can_ignore_in_no_ready) this.waitClick(pm);
            }
        }
    },

    /**
     * 時刻を指定した文字列をミリ秒単位の数値に変換する
     * "100"      →     100 (コロンがひとつも含まれない文字列はミリ秒直接指定と解釈)
     * "1:00"     →   60000 (分:秒)
     * "1:00:00"  → 3600000 (時:分:秒)
     * "0:0.999"  →     999 (小数点以下でミリ秒を指定できる)
     * @param {string} _str
     * @returns {number}
     */
    parseMilliSeconds: function (_str) {
        const str = $.trim(_str);

        // 登場するコロンを数える
        const colon_count = (str.match(/:/g) || []).length;

        // コロンを含まないならミリ秒が直接指定されているのだと解釈する
        if (colon_count === 0) {
            return parseInt(str);
        }

        let hours_str = "0";
        let minutes_str = "0";
        let seconds_str = "0";
        let milli_seconds_str = "0";

        // コロンで刻む
        const colon_hash = str.split(":");

        if (colon_count === 1) {
            // "59:59.999"
            minutes_str = colon_hash[0];
            seconds_str = colon_hash[1];
        } else {
            // "99:59:59.999"
            hours_str = colon_hash[colon_hash.length - 3];
            minutes_str = colon_hash[colon_hash.length - 2];
            seconds_str = colon_hash[colon_hash.length - 1];
        }

        // 小数点が存在するならミリ秒として解釈する
        const dot_hash = seconds_str.split(".");
        if (dot_hash[1]) {
            seconds_str = dot_hash[0];
            milli_seconds_str = dot_hash[1].padEnd(3, "0").substring(0, 3);
        }

        const hours_ms = (parseInt(hours_str) || 0) * 1000 * 60 * 60;
        const minutes_ms = (parseInt(minutes_str) || 0) * 1000 * 60;
        const seconds_ms = (parseInt(seconds_str) || 0) * 1000;
        const milli_seconds_ms = parseInt(milli_seconds_str) || 0;

        return hours_ms + minutes_ms + seconds_ms + milli_seconds_ms;
    },

    play: async function (pm) {
        // 再生しようとしているのはSEか？(BGMではなく)
        const is_se = pm.target === "se";

        // 再生スロット (例) "0", "1", "2", ...
        const buf = pm.buf;

        // これはボイスか？([voconfig]でボイス用に予約されていたbufがいままさに指定されているか？)
        const is_voice = !!this.kag.stat.map_vo.vobuf[buf];

        // ループするか？
        const is_loop = pm.loop === "true";

        // フェードインすべきかどうか
        let is_fadein = pm.fadein === "true";

        // スキップ中はフェードインしない！
        if (this.kag.stat.is_skip || parseInt(pm.time) === 0) {
            is_fadein = false;
        }

        // 次のタグに進むべきか
        const should_next_order = pm.stop === "false";

        if (should_next_order) {
            this.kag.weaklyStop();
        }

        // 音声タイプ "bgm" or "sound"
        let sound_type = is_se ? "sound" : "bgm";

        // オートモード時にボイス再生終了から何ミリ秒待ってから次のタグに進むか
        let timeout_after_voice_in_automode = 500;
        if (this.kag.stat.voconfig_waittime !== undefined) {
            timeout_after_voice_in_automode = parseInt(this.kag.stat.voconfig_waittime);
        }

        // nextOrder を発行する共通関数
        const next = () => {
            if (should_next_order) {
                this.kag.cancelWeakStop();
                this.kag.ftag.nextOrder();
            }
        };

        //
        // storage の解釈
        //

        // IE, Edge, Safari では拡張子の ogg を m4a に切り替える
        // ただし mp3 が有効になっている場合は無視する
        let storage = pm.storage;
        const browser = $.getBrowser(); // 使用ブラウザ
        if (this.kag.config.mediaFormatDefault !== "mp3") {
            if (browser === "msie" || browser === "safari" || browser === "edge") {
                storage = $.replaceAll(storage, ".ogg", ".m4a");
            }
        }

        storage = $.parseStorage(storage, sound_type);

        //
        // ボリュームの決定
        //

        // タグに指定されているボリューム
        let tag_volume = 1;
        if (pm.volume !== "") {
            tag_volume = $.parseVolume(pm.volume);
        }

        // さらにコンフィグで設定した音量比を掛け算する必要がある
        let config_volume = 1;

        switch (sound_type) {
            // BGMの場合
            case "bgm":
                config_volume = $.parseVolume(this.kag.config.defaultBgmVolume);
                // このbufの個別BGM音量が存在する場合はそれで上書き
                if (this.kag.stat.map_bgm_volume[buf]) {
                    config_volume = $.parseVolume(this.kag.stat.map_bgm_volume[buf]);
                }
                break;

            // SEの場合
            case "sound":
                config_volume = $.parseVolume(this.kag.config.defaultSeVolume);
                // このbufの個別SE音量が存在する場合はそれで上書き
                if (this.kag.stat.map_se_volume[buf] !== undefined) {
                    config_volume = $.parseVolume(this.kag.stat.map_se_volume[buf]);
                }
                break;
        }

        // タグ音量とコンフィグ音量を掛け算してボリューム完成！
        const howl_volume = tag_volume * config_volume;

        // Howlに最初に設定する音量 フェードインの場合はゼロスタート
        let initial_howl_volume = is_fadein ? 0 : howl_volume;

        //
        // いま再生中のBGMをまた再生しようとしていないか？
        //

        if (sound_type === "bgm" && this.kag.tmp.map_bgm[buf]) {
            const old_audio_obj = this.kag.tmp.map_bgm[buf];
            // もうこれ再生してるってば！
            if (storage === old_audio_obj._src) {
                // 再･再生は必要か？ オプションを確認していこう 基本はtrue
                let need_restart = true;
                if (this.kag.stat.bgmopt_samebgm_restart !== undefined) {
                    need_restart = this.kag.stat.bgmopt_samebgm_restart;
                }
                if (pm.restart === "false") {
                    need_restart = false;
                }
                if (!need_restart) {
                    // 再･再生は必要ないらしい
                    // 一応音量も見とくか
                    if (tag_volume === old_audio_obj.__tag_volume) {
                        // 音量まで一緒じゃねーか！
                    } else {
                        // 音量は違うらしいぞ！なら変える必要がある
                        // console.warn("change current volume only");
                        const time = is_fadein ? parseInt(pm.time) : 0;
                        this.kag.ftag.startTag("bgmopt", {
                            tag_volume: pm.volume,
                            next: "false",
                            time: time,
                        });
                    }
                    next();
                    return;
                }
            }
        }

        //
        // プロパティの操作
        //

        switch (sound_type) {
            // BGMの場合
            case "bgm":
                // BGM再生中！
                this.kag.tmp.is_bgm_play = true;
                this.kag.stat.current_bgm_pause_seek = ""; //ポーズ無効

                break;

            // SEの場合
            case "sound":
                // SE再生中！
                this.kag.tmp.is_se_play = true;

                // ボイス再生中！
                if (is_voice) {
                    this.kag.tmp.is_vo_play = true;
                }
                break;
        }

        //crypt機能

        if (pm.base64 != "") {
            storage = "data:audio/" + pm.base64 + ";base64," + (await $.loadTextSync(storage));
            this.kag.stat.current_bgm_base64 = pm.base64;
        } else {
            this.kag.stat.current_bgm_base64 = "";
        }

        //
        // Howlオプション
        //

        // Howlオブジェクト格納用
        let audio_obj;

        var howl_opt = {
            preload: false,
            loop: is_loop,
            src: storage,
            volume: initial_howl_volume,
            html5: pm.html5 === "true",
            // ボイスの読み込みに失敗したとき
            onloaderror: (_, e) => {
                console.error(e);
                next();
            },
        };

        // スプライト(再生区間)が指定されている場合
        let sprite_name;
        if (pm.sprite_time) {
            // "6000-10000" → 6秒時点～10秒時点を再生するように設定
            const array_sprite = pm.sprite_time.split("-");
            const sprite_from = this.parseMilliSeconds(array_sprite[0]);
            const sprite_to = this.parseMilliSeconds(array_sprite[1]);
            const duration = sprite_to - sprite_from;
            const sprite = {};
            sprite_name = "default_sprite";
            sprite[sprite_name] = [sprite_from, duration, is_loop];
            howl_opt.sprite = sprite;
        }

        // Howlオブジェクトを生成
        // まだロードも再生もされないよ
        audio_obj = new Howl(howl_opt);

        // このときのタグ音量とコンフィグ音量はそれぞれ記憶しておく [bgmopt effect="true"]対策
        audio_obj.__tag_volume = tag_volume;
        audio_obj.__config_volume = config_volume;

        //
        // 同一bufの旧オーディオの停止および破棄, 参照の格納, セーブデータロード時復元のための記憶
        //

        switch (sound_type) {
            // BGMの場合
            case "bgm":
                // このbufで再生中のオーディオがある場合は破棄！キャッシュから削除される
                if (this.kag.tmp.map_bgm[buf]) {
                    this.kag.tmp.map_bgm[buf].stop();
                    this.kag.tmp.map_bgm[buf].unload();
                }
                // 参照を格納
                this.kag.tmp.map_bgm[buf] = audio_obj;
                // セーブデータロード時に復元できるように記憶しておく
                this.kag.stat.current_bgm = pm.storage;
                this.kag.stat.current_bgm_vol = pm.volume;
                this.kag.stat.current_bgm_html5 = pm.html5;
                break;

            // SEの場合
            case "sound":
                // このbufで再生中のオーディオがある場合は破棄！キャッシュから削除される
                if (this.kag.tmp.map_se[buf]) {
                    this.kag.tmp.map_se[buf].stop();
                    this.kag.tmp.map_se[buf].unload();
                }
                // 参照を格納
                this.kag.tmp.map_se[buf] = audio_obj;
                // ループSEの記憶領域確保
                if (!this.kag.stat.current_se) {
                    this.kag.stat.current_se = {};
                }
                if (is_loop) {
                    // ループSEの場合はセーブデータロード時に復元できるように記憶しておく
                    this.kag.stat.current_se[buf] = $.extend({}, pm);
                } else {
                    // ループSEでないなら[buf]プロパティ自体を削除
                    delete this.kag.stat.current_se[buf];
                }
                break;
        }

        //
        // イベントリスナの登録
        //

        // プリロードデータを使い捨てにする場合はここに格納
        let preloaded_audio_del;

        // ロード完了時
        audio_obj.once("load", () => {
            // 使い捨てキャッシュの削除
            if (preloaded_audio_del) {
                preloaded_audio_del.unload();
                delete this.kag.tmp.preload_audio_map[storage];
            }

            this.kag.hideLoadingLog();

            //途中から再生の場合
            if (pm.seek != "") {
                audio_obj.seek(parseFloat(pm.seek));
            }

            // 再生開始 初期状態が停止の場合は再生しない
            if (pm.pause != "true") {
                audio_obj.play(sprite_name);
            } else {
                next();
            }
        });

        // 再生開始時
        audio_obj.once("play", () => {
            // フェードイン開始
            if (is_fadein) {
                audio_obj.fade(0, howl_volume, parseInt(pm.time));
            }
            // ボイスなら波形分析する
            if (is_voice) {
                this.analyzeAudioForLipSync(audio_obj, pm.chara_name);
            } else if (pm.chara) {
                this.analyzeAudioForLipSync(audio_obj, pm.chara);
            } else if (is_se) {
                const _buf = parseInt(buf);
                if (this.kag.stat.lipsync_buf_chara[buf]) {
                    pm.chara_name = this.kag.stat.lipsync_buf_chara[buf];
                    this.analyzeAudioForLipSync(audio_obj, pm.chara_name);
                } else {
                    pm.chara_name = this.kag.chara.getCharaName();
                    if (pm.chara_name) {
                        const cpm = this.kag.stat.charas[pm.chara_name];
                        if (cpm && cpm.lipsync_bufs && cpm.lipsync_bufs.includes(_buf)) {
                            this.analyzeAudioForLipSync(audio_obj, pm.chara_name);
                        }
                    }
                }
            }
            // nextOrder
            next();
        });

        // フェードイン完了時
        audio_obj.once("fade", () => {
            // console.warn("fadein complete!");
        });

        // ループしない場合のみ
        if (!is_loop) {
            // 再生終了時
            audio_obj.once("end", (e) => {
                // プロパティの操作と、特定状況でのnextOrder
                switch (sound_type) {
                    // BGMの場合
                    case "bgm":
                        // いまBGM再生してないよ！
                        this.kag.tmp.is_bgm_play = false;
                        // [wbgm]に到達してBGMの再生終了を待っている状態だったら nextOrder
                        if (this.kag.tmp.is_bgm_play_wait == true) {
                            this.kag.tmp.is_bgm_play_wait = false;
                            this.kag.ftag.nextOrder();
                        }
                        break;

                    // SEの場合
                    case "sound":
                        // SE再生してないよ！
                        this.kag.tmp.is_se_play = false;

                        // ボイス再生してないよ！
                        if (is_voice) {
                            this.kag.tmp.is_vo_play = false;
                        }

                        // 状態次第で nextOrder
                        if (this.kag.tmp.is_se_play_wait == true) {
                            // [wse]に到達してSEの再生終了を待っている状態だったら nextOrder
                            // …したいのはやまやまだが、その前に
                            // これ以外の効果音が同時に再生されていないかをチェックする必要がある

                            // SEマップを走査してほかに再生中の効果音がないかどうかをチェック
                            // ただしループSE（環境音などが想定される）は除外する必要がある
                            let is_sound_playing = false;
                            for (const key in this.kag.tmp.map_se) {
                                const howl = this.kag.tmp.map_se[key];
                                if (!howl._loop) {
                                    if (howl.playing()) {
                                        is_sound_playing = true;
                                        break;
                                    }
                                }
                            }

                            if (!is_sound_playing) {
                                this.kag.tmp.is_se_play_wait = false;
                                this.kag.ftag.nextOrder();
                            }
                        } else if (this.kag.tmp.is_vo_play_wait == true) {
                            // オートモード中に[l]や[p]に到達してボイスの再生終了を待っている状態だったら
                            // この音声がボイスである場合にのみ nextOrder
                            if (is_voice) {
                                this.kag.tmp.is_vo_play_wait = false;
                                $.setTimeout(() => {
                                    this.kag.ftag.nextOrder();
                                }, timeout_after_voice_in_automode);
                            }
                        }
                        break;
                }
            });
        }

        //
        // プリロード済みのHowlマップをチェック
        //

        // プリロードしたことがあってHTML5オプションが一致する場合はそれを使って早期リターン
        const preloaded_audio = this.kag.tmp.preload_audio_map[storage];
        if (preloaded_audio && preloaded_audio._html5 === howl_opt.html5) {
            switch (preloaded_audio.state()) {
                case "loaded":
                    // プリロードが完了している場合はふつうにロード開始
                    // (Howler.js内の処理でキャッシュが使われる)

                    // プリロードオーディオが使い捨ての場合は記憶しておく
                    if (preloaded_audio.__single_use) {
                        preloaded_audio_del = preloaded_audio;
                    }

                    audio_obj.load();
                    break;

                case "unload":
                    // アンロードで残っていることは基本的にはないが…
                    // プロパティから削除しよう
                    delete this.kag.tmp.preload_audio_map[storage];
                    audio_obj.load();
                    break;

                case "loading":
                    // プリロード側のデータがロード中の場合、ここでふつうにload()を開始すると
                    // Howler.js内でキャッシュが使われずに二重ロードが発生して望ましくない
                    // プリロード側のデータのロード完了時に改めてload()を呼ぶようにする

                    // プリロードオーディオが使い捨ての場合は記憶しておく
                    if (preloaded_audio.__single_use) {
                        preloaded_audio_del = preloaded_audio;
                    }

                    preloaded_audio.once("load", () => {
                        audio_obj.load();
                    });
                    break;
            }
            return;
        }

        // プリロードの痕跡はない
        // ふつうにロード
        this.kag.showLoadingLog();
        audio_obj.load();
    },

    /**
     * Howlオブジェクトによって再生される音声を解析してリップシンクに利用するメソッド。
     * 音声信号の振幅を計算し、それに基づいてリップシンクを更新する。
     * @param {Howl} howl - 解析対象のHowlオブジェクト。
     * @param {name} string - ボイスを発しているキャラクターの名前。
     */
    analyzeAudioForLipSync(howl, name) {
        // リップシンク対象のパーツを取得する（取得できなければこのリップシンクは無効）
        const target_parts = this.kag.chara.getLipSyncParts(name);
        if (!target_parts) return null;

        const requestAnimationFrame = (callback) => {
            return setTimeout(callback, 1000 / 30);
        };
        const cancelAnimationFrame = clearTimeout;

        // ベースのリップ画像（閉じている口の画像）だけを表示する関数
        const resetFrameOpacity = () => {
            target_parts.forEach((target_part) => {
                target_part.j_frames.showAtIndexWithVisibility(0);
            });
        };

        //
        // 波形分析
        //

        let animation_id;
        let last_timestamp = performance.now(); // 最後のフレームのタイムスタンプ
        let silent_time = 0; // 無音の経過時間を追跡
        const max_silent_duration = 10000; // 無音が続く最大時間（ミリ秒）
        const audio_context = Howler.ctx;
        const sound_node = howl._sounds[0]._node;
        const analyser = audio_context.createAnalyser();
        sound_node.connect(analyser);
        analyser.connect(audio_context.destination);
        analyser.fftSize = 32;
        const buffer_length = analyser.frequencyBinCount;
        const data_array = new Uint8Array(buffer_length);
        const analyze = () => {
            // 経過時間
            const timestamp = performance.now();
            const elapsed_time = timestamp - last_timestamp;
            // 振幅のサンプリングデータをdata_arrayに格納する
            analyser.getByteTimeDomainData(data_array);
            // 振幅の最大値を計算する
            let max = 0;
            for (let i = 0; i < buffer_length; i++) {
                if (data_array[i] > max) {
                    max = data_array[i];
                    if (max === 255) {
                        break;
                    }
                }
            }
            // 振幅を0～100に補正してリップシンクメソッドに渡す
            max = Math.max(128, max);
            const volume = (((max - 128) / (255 - 128)) * 100) | 0;
            this.kag.chara.updateLipSyncWithVoice(volume, target_parts, elapsed_time);
            // 無音の経過時間を計算
            // 既定時間無音だった場合は波形分析を中断する
            if (max <= 128) {
                silent_time += elapsed_time;
            } else {
                // 音が鳴っている場合、無音時間をリセット
                silent_time = 0;
            }
            if (silent_time >= max_silent_duration) {
                resetFrameOpacity();
                return;
            }
            // 現在のタイムスタンプを保存
            last_timestamp = timestamp;
            // 次回の波形分析を呼ぶ
            animation_id = requestAnimationFrame(analyze);
        };

        // 再生停止時に解析を中断する
        howl.on("stop", function () {
            resetFrameOpacity();
            cancelAnimationFrame(animation_id);
        });
        howl.on("end", function () {
            resetFrameOpacity();
            cancelAnimationFrame(animation_id);
        });

        // 解析開始
        analyze();
    },

    /*
    playAudio : function(audio_obj,pm,target) {


        //ボリュームの設定
        var volume =1;
        if (pm.volume != "") {
            volume = parseFloat(parseInt(pm.volume) / 100);
        }

        //コンフィグ音量の適用
        var ratio =1;

            //デフォルトで指定される値を設定
            if (target === "bgm") {
                if (!this.kag.config.defaultBgmVolume) {
                    ratio = 1;
                } else {
                    ratio = parseFloat(parseInt(this.kag.config.defaultBgmVolume) / 100);
                }
            } else {
                if (!this.kag.config.defaultSeVolume) {
                    ratio = 1;
                } else {
                    ratio = parseFloat(parseInt(this.kag.config.defaultSeVolume) / 100);
                }
            }

        volume *= ratio;

        audio_obj.setVolume(volume);
        audio_obj.play();
    },

    //フラッシュで再生する
    playSwf : function(pm) {

        var target = "bgm";

        if (pm.target == "se") {
            target = "sound";
        }

        var repeat = 1;

        if (pm.loop == "true") {
            repeat = 9999;
        }

        var target = "bgm";
        if (pm.target == "se") {
            target = "sound";
        }

        var storage_url = "";

        if ($.isHTTP(pm.storage)) {
            storage_url = pm.storage;
        } else {
            storage_url = "./data/" + target + "/" + pm.storage;
        }

        if (target === "bgm") {
            this.kag.stat.current_bgm = pm.storage;
            this.kag.stat.current_bgm_vol = pm.volume;

            this.kag.sound_swf.playMusic(storage_url, repeat);
        } else {
            this.kag.sound_swf.playSound(storage_url, repeat);
        }

        if (pm.stop == "false") {
            this.kag.ftag.nextOrder();
        }

    }

    */
};

/*
#[stopbgm]

:group
オーディオ

:title
BGMの停止

:exp
再生しているBGMの再生を停止します。

:sample
[stopbgm]

:param

#[end]
*/

tyrano.plugin.kag.tag.stopbgm = {
    pm: {
        fadeout: "false",
        time: 2000,
        target: "bgm",
        buf: "0",
        buf_all: "false",
        stop: "false", //trueの場合自動的に次の命令へ移動しない。ロード対策
    },

    start: function (pm) {
        var that = this;

        // nextOrder を発行するかどうか
        const should_next_order = pm.stop === "false";

        // Howlオブジェクト格納マップ
        let target_map = null;

        // フェードアウトするかどうか
        let is_fadeout = pm.fadeout === "true";

        // スキップ中はフェードインしない！
        if (this.kag.stat.is_skip || parseInt(pm.time) === 0) {
            is_fadeout = false;
        }

        //
        // プロパティの操作
        //

        if (pm.target == "bgm") {
            target_map = this.kag.tmp.map_bgm;
            this.kag.tmp.is_bgm_play = false;
            this.kag.tmp.is_bgm_play_wait = false;
            if (should_next_order) {
                this.kag.stat.current_bgm = "";
                this.kag.stat.current_bgm_vol = "";
            }
        } else {
            target_map = this.kag.tmp.map_se;
            this.kag.tmp.is_vo_play = false;
            this.kag.tmp.is_se_play = false;
            this.kag.tmp.is_se_play_wait = false;
            if (this.kag.stat.current_se && this.kag.stat.current_se[pm.buf]) {
                delete this.kag.stat.current_se[pm.buf];
            }
        }

        //
        // Howlオブジェクトを操作して実際に音を止める
        //

        // Howlオブジェクトが格納されているマップ(連想配列)を洗っていく
        for (const key in target_map) {
            // これは操作対象か？ keyがpm.bufに一致するなら操作対象
            // あるいは pm.buf_all="true" が指定されているなら問答無用で操作対象([playse ... clear="true"]用の隠しパラメータ)
            const is_this_target = String(key) === String(pm.buf) || pm.buf_all === "true";

            // 操作対象じゃないならスルー
            if (!is_this_target) {
                continue;
            }

            // Howlオブジェクトの参照を取得し、マップからは削除
            const audio_obj = target_map[key];
            delete target_map[key];

            // Howlオブジェクトが取れなければスルー
            if (!audio_obj) {
                continue;
            }

            if (!is_fadeout || !audio_obj.playing()) {
                // フェードアウトしない場合, あるいはもう止まってる場合
                // 単純に停止メソッドを呼ぶ
                audio_obj.stop();
                audio_obj.unload();
            } else {
                // フェードアウトする場合
                // フェードアウト完了イベントリスナを登録する関数
                const bind_fade_complete_listener = () => {
                    audio_obj.once("fade", () => {
                        if (audio_obj.volume() !== 0) {
                            // フェードが完了したのに音量がゼロじゃない…だと…
                            // フェードイン完了時のfadeイベントと干渉してしまったので登録し直す
                            bind_fade_complete_listener();
                            return;
                        }
                        // console.warn("fadeout complete!");
                        audio_obj.stop();
                        audio_obj.unload();
                    });
                };
                bind_fade_complete_listener();
                audio_obj.fade(audio_obj.volume(), 0, parseInt(pm.time));
            }
        }

        if (should_next_order) {
            this.kag.ftag.nextOrder();
        }
    },
};

/*
#[fadeinbgm]

:group
オーディオ

:title
BGMをフェードイン再生

:exp
BGMを徐々に再生します。

一部環境（Firefox、Sarafi等）においては対応していません。その場合、`[playbgm]`の動作となります。

:sample
[fadeinbgm storage=sample.mp3 loop=false time=3000]

:param
storage     = !!audio,
loop        = !!,
sprite_time = !!,
time        = フェードイン時間をミリ秒で指定します。,
volume      = !!,
html5       = !!,
pause       = `true`を指定するとタグ実行時にBGMを再生しません。`[resumebgm]`で再生できます,
seek        = 再生開始時間を設定できます。例えば4.5と指定すると4.5秒進んだ位置からBGMが再生されます

#[end]
*/

tyrano.plugin.kag.tag.fadeinbgm = {
    vital: ["storage"],

    pm: {
        loop: "true",
        storage: "",
        fadein: "true",
        sprite_time: "", //200-544
        html5: "false",
        time: 2000,
        pause: "false",
        seek: "",
    },

    start: function (pm) {
        // 動作安定化のためにpm.timeの最低値として100を保証
        if (parseInt(pm.time) <= 100) {
            pm.time = 100;
        }

        this.kag.ftag.startTag("playbgm", pm);
    },
};

/*
#[fadeoutbgm]

:group
オーディオ

:title
BGMをフェードアウト停止

:exp
再生中のBGMをフェードアウトしながら停止します。

一部環境（Firefox、Sarafi等）においては対応していません。その場合、`[stopbgm]`の動作となります。

:sample
[fadeoutbgm time=3000]

:param
time = フェードアウト時間をミリ秒で指定します。

#[end]
*/
tyrano.plugin.kag.tag.fadeoutbgm = {
    //vital:["time"],

    pm: {
        loop: "true",
        storage: "",
        fadeout: "true",
        time: 2000,
    },

    start: function (pm) {
        // 動作安定化のためにpm.timeの最低値として100を保証
        if (parseInt(pm.time) <= 100) {
            pm.time = 100;
        }

        this.kag.ftag.startTag("stopbgm", pm);
    },
};

/*
#[xchgbgm]

:group
オーディオ

:title
BGMのクロスフェード（入れ替え）

:exp
【非推奨】BGMを入れ替えます。音楽が交差して切り替わる演出に使用できます。

一部環境（Firefox、Safari等）において対応していません。その場合、`[playbgm]`の動作となります。

<b>V515以降：</b>非推奨の機能となっていましたが、使えるようになりました。


:sample
[xchgbgm storage=new.mp3 loop=true time=3000]

:param
storage = 次に再生するファイルを指定します。,
loop    = !!,
time    = クロスフェードを行なっている時間をミリ秒で指定します。

#[end]
*/

tyrano.plugin.kag.tag.xchgbgm = {
    vital: ["storage"],

    pm: {
        loop: "true",
        storage: "",
        fadein: "true",
        fadeout: "true",
        time: 2000,
        buf: "0",
    },

    start: function (pm) {
        // スキップ中はフェード処理しない！
        if (this.kag.stat.is_skip || parseInt(pm.time) === 0) {
            pm.time = "0";
            pm.fadein = "false";
            this.kag.ftag.startTag("playbgm", pm);
            return;
        }

        // 動作安定化のためにpm.timeの最低値として100を保証
        if (parseInt(pm.time) <= 100) {
            pm.time = 100;
        }

        // このbufで再生中のBGMがある場合
        const audio_obj = this.kag.tmp.map_bgm[pm.buf];
        if (audio_obj && audio_obj.playing()) {
            // フェードアウト完了イベントリスナを登録する関数
            const bind_fade_complete_listener = () => {
                audio_obj.once("fade", () => {
                    if (audio_obj.volume() !== 0) {
                        // フェードが完了したのに音量がゼロじゃない…だと…
                        // フェードイン完了時のfadeイベントと干渉してしまったので登録し直す
                        bind_fade_complete_listener();
                        return;
                    }
                    // console.warn("fadeout complete!");
                    audio_obj.stop();
                    audio_obj.unload();
                });
            };
            bind_fade_complete_listener();
            audio_obj.fade(audio_obj.volume(), 0, parseInt(pm.time));

            // このあとの[playbgm]で操作されないように参照を消しておく
            delete this.kag.tmp.map_bgm[pm.buf];
        }

        this.kag.ftag.startTag("playbgm", pm);
    },
};

/*
#[playse]

:group
オーディオ

:title
効果音の再生

:exp
効果音を再生します。再生する音声ファイルは`data/sound`フォルダに配置します。

<b>`mp3`形式推奨</b>。`ogg``m4a``wav`形式にも対応します。

ただし、<b>`ogg`形式は一部のブラウザにおいて動作しません</b>（IE、Safari）。`ogg`形式を使う場合、IEとSafariにも対応させるためには、同じフォルダに同名の`m4a`ファイルを用意してください。そうした場合、IEやSafariでは自動で`m4a`形式のファイルが選択されるようになります。（ブラウザゲームとして公開しない場合は不要）

:sample
[playse storage=sound.mp3 loop=false ]

:param
storage     = !!audio,
buf         = 効果音を再生するスロットを指定できます。すでに指定スロットで再生中の効果音がある場合、その効果音は停止されます。,
loop        = !!,
sprite_time = !!,
clear       = `true`または`false`。`true`を指定すると、他のスロットで再生中の効果音がある場合、そちらもすべて停止します。音声などは`trueが`便利でしょう。,
volume      = !!,
html5       = !!

#[end]
*/

tyrano.plugin.kag.tag.playse = {
    vital: ["storage"],

    pm: {
        storage: "",
        target: "se",
        volume: "",
        loop: "false",
        buf: "0",
        sprite_time: "", //200-544
        html5: "false",
        clear: "false", //他のSEがなっている場合、それをキャンセルして、新しく再生します
    },

    start: function (pm) {
        if (pm.clear == "true") {
            this.kag.ftag.startTag("stopbgm", {
                target: "se",
                stop: "true",
                buf_all: "true",
            });
        }

        this.kag.ftag.startTag("playbgm", pm);
    },
};

/*
#[stopse]

:group
オーディオ

:title
効果音の停止

:exp
効果音を再生を停止します。

:sample
[stopse]

:param
buf = 効果音を停止するスロットを指定できます。

#[end]
*/

tyrano.plugin.kag.tag.stopse = {
    pm: {
        storage: "",
        fadeout: "false",
        time: 2000,
        buf: "0",
        target: "se",
    },

    start: function (pm) {
        this.kag.ftag.startTag("stopbgm", pm);
    },
};

/*
#[fadeinse]

:group
オーディオ

:title
効果音のフェードイン

:exp
効果音をフェードインしながら再生します。

:sample
[fadeinse storage=sound.mp3 loop=false time=2000]

:param
storage     = !!audio,
loop        = !!,
sprite_time = !!,
buf         = 効果音を停止するスロットを指定できます。,
time        = フェードイン時間をミリ秒で指定します。,
html5       = !!

#[end]
*/

tyrano.plugin.kag.tag.fadeinse = {
    vital: ["storage", "time"],

    pm: {
        storage: "",
        target: "se",
        loop: "false",
        volume: "",
        fadein: "true",
        buf: "0",
        sprite_time: "", //200-544
        html5: "false",
        time: "2000",
    },

    start: function (pm) {
        // 動作安定化のためにpm.timeの最低値として100を保証
        if (parseInt(pm.time) <= 100) {
            pm.time = 100;
        }

        this.kag.ftag.startTag("playbgm", pm);
    },
};

/*
#[fadeoutse]

:group
オーディオ

:title
効果音のフェードアウト

:exp
効果音をフェードアウトします。

:sample
[fadeoutse time=2000]

:param
time = フェードアウト時間をミリ秒で指定します。,
buf  = 効果音を停止するスロットを指定できます。

#[end]
*/

tyrano.plugin.kag.tag.fadeoutse = {
    pm: {
        storage: "",
        target: "se",
        loop: "false",
        buf: "0",
        fadeout: "true",
    },

    start: function (pm) {
        // 動作安定化のためにpm.timeの最低値として100を保証
        if (parseInt(pm.time) <= 100) {
            pm.time = 100;
        }

        this.kag.ftag.startTag("stopbgm", pm);
    },
};

/*
#[bgmopt]

:group
オーディオ

:title
BGM設定

:exp
BGMの設定を変更できます。

プレイヤーがスマホブラウザから閲覧している場合は端末の制限により音量が変更できませんので注意してください。

「`buf`パラメータが指定されていない`[bgmopt]`タグ」を通過した時点で、`buf`ごとの音量設定が初期化される仕様です。`[bgmopt]`に`buf`を指定するかしないかは、ゲームプロジェクトで統一するようにしましょう。


:sample
[bgmopt volume=50 ]

:param
volume          = BGMのコンフィグ音量を`0`〜`100`で指定できます。,
buf             = 設定を変更するスロットを指定できます。省略すると、全スロット共通の音量が設定されます。,
effect          = コンフィグ音量の変更を現在再生中のBGMに即反映するかどうか。`true`または`false`で指定します。,
time            = 音量の変更を即反映する場合のフェード時間をミリ秒単位で指定できます。,
tag_volume      = `0`〜`100`を指定して、現在再生中のBGMのタグ音量を変更できます。タグ音量とは`[playbgm]`タグに指定されていた音量のことです。この機能はたとえば、もともと`[playbgm volume="50"]`で再生され始めたBGMの音量を、`[playbgm volume="100"]`で再生されていた場合の音量に修正したい、というケースで使用可能です。これを指定しただけではコンフィグ音量は変更されません。これを指定すると、`effect`が強制的に`true`になります。,
samebgm_restart = `[playbgm]`タグで再生しようとしたBGMがすでに再生中だった場合の処理を設定できます。`true`なら最初から再生し直し、`false`ならスルー。,

#[end]
*/

tyrano.plugin.kag.tag.bgmopt = {
    pm: {
        volume: "",
        effect: "true",
        buf: "",
        tag_volume: "",
        next: "true",
        time: "",
        samebgm_restart: "",
    },

    start: function (pm) {
        // タグ音量とコンフィグ音量
        let tag_volume;
        let config_volume;

        // スロットが指定されているかどうかで場合分け
        if (pm.buf) {
            // スロットが指定されている場合
            if (pm.volume !== "") this.kag.stat.map_bgm_volume[pm.buf] = pm.volume;
            config_volume = this.kag.stat.map_bgm_volume[pm.buf];
        } else {
            // スロットが指定されていない場合は個別設定を初期化してから代入
            if (pm.volume !== "") {
                this.kag.stat.map_bgm_volume = {};
                this.kag.config.defaultBgmVolume = pm.volume;
            }
            config_volume = this.kag.config.defaultBgmVolume;
        }

        // コンフィグ音量がここで確定
        config_volume = $.parseVolume(config_volume);

        // タグ音量を変更する場合
        // [playbgm volume="50"]で再生され始めたBGMを、[playbgm volume="100"]で再生されていた場合の音量に変更する、みたいな処理
        if (pm.tag_volume !== "") {
            tag_volume = $.parseVolume(pm.tag_volume);
            pm.effect = "true";
            // ロード復元用のプロパティの更新も忘れない
            this.kag.stat.current_bgm_vol = pm.tag_volume;
        }

        // すぐに反映(スマホアプリの場合は不可)
        const target_map = this.kag.tmp.map_bgm;
        if (pm.effect == "true" && this.kag.define.FLAG_APRI == false) {
            // 音量変更用のオプション
            const options = {
                config: config_volume,
                tag: tag_volume,
                time: pm.time,
            };
            // スロットが指定されているかどうかで場合分け
            if (pm.buf) {
                // スロット指定ありの場合は該当するオーディオにのみ適用
                const audio_obj = target_map[pm.buf];
                if (audio_obj) this.kag.changeHowlVolume(audio_obj, options);
            } else {
                // スロット指定なしの場合は再生中のすべてのオーディオに適用
                for (const key in target_map) {
                    const audio_obj = target_map[key];
                    if (audio_obj) this.kag.changeHowlVolume(audio_obj, options);
                }
            }
        }

        if (pm.samebgm_restart) {
            this.kag.stat.bgmopt_samebgm_restart = pm.samebgm_restart === "true";
        }

        // システム変数の変更とセーブ(sfのデータは[eval]実行時点でセーブされる)
        if (pm.volume !== undefined && pm.volume !== "") {
            this.kag.ftag.startTag("eval", {
                exp: "sf._system_config_bgm_volume = " + pm.volume,
                next: pm.next,
            });
        } else {
            if (pm.next !== "false") this.kag.ftag.nextOrder();
        }
    },
};

/*
#[seopt]

:group
オーディオ

:title
SE設定

:exp
SEの設定を変更できます。

プレイヤーがスマホブラウザから閲覧している場合は端末の制限により音量が変更できませんので注意してください。

「`buf`パラメータが指定されていない`[seopt]`タグ」を通過した時点で、`buf`ごとの音量設定が初期化される仕様です。`[seopt]`に`buf`を指定するかしないかは、ゲームプロジェクトで統一するようにしましょう。

:sample
[seopt volume=50 ]

:param
volume          = SEのコンフィグ音量を`0`〜`100`で指定できます。,
buf             = 設定を変更するスロットを指定できます。省略すると、全スロット共通の音量が設定されます。,
effect          = コンフィグ音量の変更を現在再生中のSEに即反映するかどうか。`true`または`false`で指定します。,
time            = 音量の変更を即反映する場合のフェード時間をミリ秒単位で指定できます。,
tag_volume      = `0`〜`100`を指定して、現在再生中のSEのタグ音量を変更できます。タグ音量とは`[playse]`タグに指定されていた音量のことです。この機能はたとえば、もともと`[playse volume="50"]`で再生され始めたSEの音量を、`[playse volume="100"]`で再生されていた場合の音量に修正したい、というケースで使用可能です。これを指定しただけではコンフィグ音量は変更されません。これを指定すると、`effect`が強制的に`true`になります。,


#[end]
*/

tyrano.plugin.kag.tag.seopt = {
    pm: {
        volume: "",
        effect: "true",
        buf: "",
        tag_volume: "",
        next: "true",
    },

    start: function (pm) {
        // タグ音量とコンフィグ音量
        let tag_volume;
        let config_volume;

        // スロットが指定されているかどうかで場合分け
        if (pm.buf) {
            // スロットが指定されている場合
            if (pm.volume !== "") this.kag.stat.map_se_volume[pm.buf] = pm.volume;
            config_volume = this.kag.stat.map_se_volume[pm.buf];
        } else {
            // スロットが指定されていない場合は個別設定を初期化してから代入
            if (pm.volume !== "") {
                this.kag.stat.map_se_volume = {};
                this.kag.config.defaultSeVolume = pm.volume;
            }
            config_volume = this.kag.config.defaultSeVolume;
        }

        // コンフィグ音量がここで確定
        config_volume = $.parseVolume(config_volume);

        // タグ音量を変更する場合
        // [playbgm volume="50"]で再生され始めたBGMを、[playbgm volume="100"]で再生されていた場合の音量に変更する、みたいな処理
        if (pm.tag_volume !== "") {
            tag_volume = $.parseVolume(pm.tag_volume);
            pm.effect = "true";
        }

        // すぐに反映(スマホアプリの場合は不可)
        const target_map = this.kag.tmp.map_se;
        if (pm.effect == "true" && this.kag.define.FLAG_APRI == false) {
            // 音量変更用のオプション
            const options = {
                config: config_volume,
                tag: tag_volume,
                time: pm.time,
            };
            // スロットが指定されているかどうかで場合分け
            if (pm.buf) {
                // スロット指定ありの場合は該当するオーディオにのみ適用
                const audio_obj = target_map[pm.buf];
                if (audio_obj) {
                    this.kag.changeHowlVolume(audio_obj, options);
                    // ロード復元用のプロパティの更新も忘れない
                    if (this.kag.stat.current_se[pm.buf]) {
                        this.kag.stat.current_se[pm.buf].volume = pm.tag_volume;
                    }
                }
            } else {
                // スロット指定なしの場合は再生中のすべてのオーディオに適用
                for (const key in target_map) {
                    const audio_obj = target_map[key];
                    if (audio_obj) {
                        this.kag.changeHowlVolume(audio_obj, options);
                        // ロード復元用のプロパティの更新も忘れない
                        if (this.kag.stat.current_se[key]) {
                            this.kag.stat.current_se[key].volume = pm.tag_volume;
                        }
                    }
                }
            }
        }

        // システム変数の変更とセーブ(sfのデータは[eval]実行時点でセーブされる)
        if (pm.volume !== undefined && pm.volume !== "") {
            this.kag.ftag.startTag("eval", {
                exp: "sf._system_config_se_volume = " + pm.volume,
                next: pm.next,
            });
        } else {
            if (pm.next !== "false") this.kag.ftag.nextOrder();
        }
    },
};

/*
#[changevol]

:group
オーディオ

:title
再生中のオーディオの音量変更

:exp
現在再生中のオーディオの音量を変更できます。

`[playbgm]`や`[playse]`などでオーディオを再生し始めるときと同様に、次の計算式で最終的な音量が決定されます。

`[changevol]`に指定した音量(%) × `[bgmopt]`や`[seopt]`で設定したコンフィグ音量(%)

プレイヤーがスマホブラウザから閲覧している場合は端末の制限により音量が変更できませんので注意してください。

:sample
[bgmopt volume="30"]Config: 30[l][r]
[playbgm volume="40" storage="music.ogg"]Audio: 40[l][r]
[changevol volume="100"]Audio: 40→100[l][r]
[changevol volume="15" time="1000"]Audio: 100→15[l][r]
[bgmopt volume="100" effect="true"]Config: 30→100[l][r]
[changevol volume="100"]Audio: 15→100[l][r]

:param
target = BGMの音量を変更する場合は"bgm"、SEの音量を変更する場合は"se"と指定します。,
volume = 音量を`0`〜`100`で指定します。,
buf    = 設定を変更するスロットを指定できます。省略すると、全スロットの音声に対して処理が実行されます。,
time   = フェード時間をミリ秒単位で指定できます。,

#[end]
*/

tyrano.plugin.kag.tag.changevol = {
    pm: {
        target: "bgm",
        volume: "",
        buf: "",
        time: "",
        next: "true",
    },

    obtainTargets: function (target, buf) {
        const target_map = target === "bgm" ? this.kag.tmp.map_bgm : this.kag.tmp.map_se;
        const target_dict = {};
        if (buf) {
            const audio_obj = target_map[buf];
            if (audio_obj) {
                target_dict[buf] = audio_obj;
            }
        } else {
            for (const key in target_map) {
                const audio_obj = target_map[key];
                if (audio_obj) {
                    target_dict[key] = audio_obj;
                }
            }
        }
        return target_dict;
    },

    start: function (pm) {
        // next="false"でないときだけ次に進む
        const next = () => {
            if (pm.next !== "false") {
                this.kag.ftag.nextOrder();
            }
        };

        // volumeパラメータが指定されてないならやることない
        // スマホアプリの場合も不可、早期リターン
        if (pm.volume === "" || this.kag.define.FLAG_APRI) {
            next();
            return;
        }

        // タグ音量 0.0～1.0
        const tag_volume = $.parseVolume(pm.volume);

        // 操作したいのはBGMですか
        const is_bgm = pm.target === "bgm";

        // BGMならここでロード復元用のプロパティを更新しておく
        if (is_bgm) {
            this.kag.stat.current_bgm_vol = pm.volume;
        }

        const volume_map = is_bgm ? this.kag.stat.map_bgm_volume : this.kag.stat.map_se_volume;
        const default_volume = is_bgm ? this.kag.config.defaultBgmVolume : this.kag.config.defaultSeVolume;

        // 操作対象のオーディオについて
        const target_dict = this.obtainTargets(pm.target, pm.buf);
        for (const buf in target_dict) {
            const audio_obj = target_dict[buf];
            let config_volume = volume_map[buf] ? volume_map[buf] : default_volume;
            config_volume = $.parseVolume(config_volume);

            this.kag.changeHowlVolume(audio_obj, {
                config: config_volume,
                tag: tag_volume,
                time: pm.time,
            });

            // ループSEのロード復元用のプロパティの更新
            if (!is_bgm && this.kag.stat.current_se[buf]) {
                this.kag.stat.current_se[buf].volume = pm.volume;
            }
        }

        next();
    },
};

/*
#[pausebgm]

:group
オーディオ

:title
再生中のBGMの一時停止

:exp
現在再生中のBGMを一時停止できます。
少しあとに同じBGMの再生を再開する場合のみ使用してください。それ以外の場合は`[stopbgm]`での停止が適切です。

:sample

:param
buf    = スロットを指定できます。省略すると、全スロットの音声に対して処理が実行されます。,

#[end]
*/

tyrano.plugin.kag.tag.pausebgm = {
    pm: {
        target: "bgm",
        buf: "",
        next: "true",
    },

    start: function (pm) {
        // next="false"でないときだけ次に進む
        const next = () => {
            if (pm.next !== "false") {
                this.kag.ftag.nextOrder();
            }
        };

        // 操作対象のオーディオについて
        const target_dict = this.kag.getTag("changevol").obtainTargets(pm.target, pm.buf);
        for (const buf in target_dict) {
            const audio_obj = target_dict[buf];
            audio_obj.pause();
            this.kag.stat.current_bgm_pause_seek = audio_obj.seek();
        }

        next();
    },
};

/*
#[resumebgm]

:group
オーディオ

:title
一時停止中のオーディオの再開

:exp
`[pausebgm]`で停止していたBGM再生を再開できます。
一時停止中のオーディオを再開できます。

:sample

:param
buf    = スロットを指定できます。省略すると、全スロットの音声に対して処理が実行されます。,

#[end]
*/

tyrano.plugin.kag.tag.resumebgm = {
    pm: {
        target: "bgm",
        buf: "",
        next: "true",
    },

    start: function (pm) {
        // next="false"でないときだけ次に進む
        const next = () => {
            if (pm.next !== "false") {
                this.kag.ftag.nextOrder();
            }
        };

        // 操作対象のオーディオについて
        const target_dict = this.kag.getTag("changevol").obtainTargets(pm.target, pm.buf);
        for (const buf in target_dict) {
            const audio_obj = target_dict[buf];
            audio_obj.play();
        }

        this.kag.stat.current_bgm_pause_seek = "";

        next();
    },
};

/*
#[pausese]

:group
オーディオ

:title
再生中のSEの一時停止

:exp
現在再生中のSEを一時停止できます。

:sample

:param
buf    = スロットを指定できます。省略すると、全スロットの音声に対して処理が実行されます。,

#[end]
*/

tyrano.plugin.kag.tag.pausese = {
    pm: {
        target: "se",
        buf: "",
        next: "true",
    },

    start: function (pm) {
        this.kag.getTag("pausebgm").start(pm);
    },
};

/*
#[resumese]

:group
オーディオ

:title
一時停止中のSEの再開

:exp
一時停止中のSEを再開できます。

:sample

:param
buf    = スロットを指定できます。省略すると、全スロットの音声に対して処理が実行されます。,

#[end]
*/

tyrano.plugin.kag.tag.resumese = {
    pm: {
        target: "se",
        buf: "",
        next: "true",
    },

    start: function (pm) {
        this.kag.getTag("resumebgm").start(pm);
    },
};

/*
#[wbgm]

:group
オーディオ

:title
BGMの再生完了を待つ

:exp
BGMの再生完了を待ちます。

PCアプリ、ブラウザゲームで利用できます。
スマホアプリでは利用できませんので注意してください。

`[playbgm]`でループ再生している場合は永遠に止まります。こちらも要注意。

:sample

:param

#[end]
*/

//BGMのフェード完了を待ちます
tyrano.plugin.kag.tag.wbgm = {
    pm: {},
    start: function () {
        //今、音楽再生中なら、
        if (this.kag.tmp.is_bgm_play == true) {
            //this.kag.weaklyStop();
            this.kag.tmp.is_bgm_play_wait = true;
        } else {
            this.kag.ftag.nextOrder();
        }
    },
};

/*
#[wse]

:group
オーディオ

:title
効果音の再生完了を待つ

:exp
効果音の再生完了を待ちます。

PCアプリ、ブラウザゲームで利用できます。
スマホアプリでは利用できませんので注意してください。

:sample

:param

#[end]
*/

tyrano.plugin.kag.tag.wse = {
    pm: {},
    start: function () {
        //今、音楽再生中なら、

        if (this.kag.tmp.is_se_play == true) {
            //this.kag.weaklyStop();
            this.kag.tmp.is_se_play_wait = true;
        } else {
            this.kag.ftag.nextOrder();
        }
    },
};

/*
#[voconfig]

:group
ボイス・読み上げ

:title
ボイスの再生設定

:exp
ボイスを効率的に再生するための設定ができます。

キャラクター名と音声ファイル名を関連させておくことで、キャラ名表示のタイミングで音声ファイルを順番に再生させることができます。

このタグで設定をした後、`[vostart]`タグで自動再生を開始しないと有効になりません。

:sample
[voconfig sebuf=2 name="akane" vostorage="akane_{number}.ogg" number=1 ]
[voconfig sebuf=2 name="yamato" vostorage="yamato_{number}.ogg" number=1 ]

;音声自動再生を開始する。必ず必要です。
[vostart]

#akane
ここで音声再生(akane_1.ogg)[p]

#akane
次の音声再生(akane_2.ogg)[p]

#yamato
やまとの音声再生(yamato_1.ogg)[p]

#akane
あかねの音声再生(akane_3.ogg)[p]

:param
sebuf     = ボイスで使用する`[playse]`の`buf`を指定します。,
name      = ボイスを再生するキャラクター名を指定します。`[chara_new]`タグの`name`。,
vostorage = 音声ファイルとして使用するファイル名のテンプレートを指定します。`{number}`の部分には、再生されることに+1された数値が入っていきます。,
number    = `vostorage`の`{number}`に当てはめる数値の初期値。,
waittime  = オートモードにおいて、ボイスを再生し終わってから次のメッセージに進むまでに何ミリ秒待つか。

:demo
2,kaisetsu/19_voconfig

#[end]
*/

tyrano.plugin.kag.tag.voconfig = {
    pm: {
        sebuf: "",
        name: "",
        vostorage: "",
        number: "",
        waittime: "",
        preload: "",
    },
    start: function (pm) {
        var map_vo = this.kag.stat.map_vo;

        //ボイスバッファに指定する
        this.kag.stat.map_vo["vobuf"][pm.sebuf] = 1;

        if (pm.name != "") {
            var vochara = {};
            if (this.kag.stat.map_vo["vochara"][pm.name]) {
                vochara = this.kag.stat.map_vo["vochara"][pm.name];
            } else {
                vochara = {
                    vostorage: "",
                    buf: pm.sebuf || "0",
                    number: 0,
                };
            }

            if (pm.sebuf !== "") {
                vochara["buf"] = pm.sebuf;
            }

            if (pm.vostorage != "") {
                vochara["vostorage"] = pm.vostorage;
            }

            if (pm.number !== "") {
                vochara["number"] = pm.number;
            }

            this.kag.stat.map_vo["vochara"][pm.name] = vochara;
        }

        // オートモード時にボイス再生終了から何ミリ秒待つか
        if (pm.waittime) {
            this.kag.stat.voconfig_waittime = parseInt(pm.waittime);
        }

        // ボイス再生時に次のボイスを自動でプリロードするかどうか
        if (pm.preload) {
            this.kag.stat.voconfig_preload = pm.preload === "true";
        }

        this.kag.ftag.nextOrder();
    },
};

/*
#[vostart]

:group
ボイス・読み上げ

:title
ボイス自動再生開始

:exp
`[voconfig]`で指定したボイスの自動再生を開始します。
これ以降、`#`で名前を指定したときに紐付いたボイスが再生されていきます。

:sample

:param

:demo
2,kaisetsu/19_voconfig

#[end]
*/

tyrano.plugin.kag.tag.vostart = {
    pm: {},
    start: function () {
        this.kag.stat.vostart = true;

        // 次のボイスのプリロード
        if (this.kag.stat.voconfig_preload) {
            this.kag.preloadNextVoice();
        }

        this.kag.ftag.nextOrder();
    },
};

/*
#[vostop]

:group
ボイス・読み上げ

:title
ボイス自動再生停止

:exp
`[voconfig]`で指定したボイスの自動再生を停止します。
これ以降、`#`で名前を指定してもボイスは再生されません。

:sample

:param

#[end]
*/

tyrano.plugin.kag.tag.vostop = {
    pm: {},
    start: function () {
        this.kag.stat.vostart = false;
        this.kag.ftag.nextOrder();
    },
};

/*
#[speak_on]

:group
ボイス・読み上げ

:title
読み上げ機能の有効化

:exp
ストーリーのシナリオを音声で読み上げることができます。

<b>★注意</b>
ブラウザゲームのみ動作。PCアプリとして出力した場合には動作しません。

:sample
[speak_on]

:param
volume = 音量を`0`～`100`で指定します。,
pitch  = 声の高さを`100`を基準とする比率で指定します。指定した数値が大きいほど声が高くなります。,
rate   = 声の速度を`100`を基準とする比率で指定します。指定した数値が大きいほど早口になります。,
cancel = テキスト読み上げ中に次のテキスト読み上げが差し込まれた場合の動作を指定できます。`true`を指定すると読み上げを中断して新しいテキストを読み上げます。`false`を指定すると中断は行わず、読み上げが完了次第次のテキストを読み上げるようになります。,

#[end]
*/

tyrano.plugin.kag.tag.speak_on = {
    vital: [],

    pm: {
        volume: "100",
        pitch: "100",
        rate: "100",
        cancel: "false",
    },

    start: function (pm) {
        var that = this;

        if (!("speechSynthesis" in window)) {
            console.error("*error:この環境は[speak_on]の読み上げ機能に対応していません");
            this.kag.ftag.nextOrder();
            return;
        }

        that.kag.stat.play_speak = true;
        if (pm.volume) {
            this.kag.tmp.speak_on_volume = parseInt(pm.volume) / 100;
        }
        if (pm.pitch) {
            this.kag.tmp.speak_on_pitch = parseInt(pm.pitch) / 100;
        }
        if (pm.rate) {
            this.kag.tmp.speak_on_rate = parseInt(pm.rate) / 100;
        }
        if (pm.cancel) {
            this.kag.tmp.speak_on_cancel = pm.cancel === "true";
        }

        const voices = window.speechSynthesis.getVoices();
        console.warn(voices);

        this.kag.ftag.nextOrder();
    },
};

/*
#[speak_off]

:group
ボイス・読み上げ

:title
読み上げ機能の無効化

:exp
シナリオの読み上げをオフにします。

:sample
[speak_off]

:param

#[end]
*/

tyrano.plugin.kag.tag.speak_off = {
    vital: [],

    pm: {
        volume: "",
    },

    start: function (pm) {
        var that = this;

        this.kag.stat.play_speak = false;
        this.kag.ftag.nextOrder();
    },
};



/*
#[popopo]

:group
オーディオ

:title
ポポポ音再生

:exp
テキストに合わせてポポポという電子音を流すことができます。

:sample

:param
type=7つのキーワードsine/square/sawtooth/triangle/noise/file/noneのいずれかで指定します。順に、正弦波/矩形波/のこぎり波/三角波/ホワイトノイズ/音声ファイル再生/再生しない、を意味します。,
volume=音の大きさ。0～100の数値またはキーワードdefaultで指定します。defaultを指定すると、コンフィグのSE効果音量を参照します。,
time=ポポポ音の長さをミリ秒で指定します。typeがfileの場合は無意味。デフォルトは20。,
tailtime=ポポポ音のフェードアウト時間をミリ秒で指定します。typeがfileの場合は無意味。デフォルトは30。,
frequency=ポポポ音の音程。A/A+/B/B+/C/C+/D/D+/E/E+/F/F+/G/G+のいずれかのキーワードで指定します。それぞれラ/ラ♯/……/ソ/ソ♯を意味します。なお、typeがfileあるいはtypeがnoiseの場合は無意味。,
octave=音(オクターブ)の高さを整数で指定します。デフォルトは0。1増減させるごとに隣のオクターブに移動します。typeがfileあるいはtypeがnoiseの場合は無意味。,
samplerate=ポポポ音のサンプルレート。typeがnoiseの場合のみ機能します。初期値は44000。3000以上、192000以下でなければなりません。,
buf=typeがfileの場合のみ機能します。再生するスロットを整数で指定します。,
storage=type=fileの場合のみ機能します。再生する音声ファイル名を指定します。,
mode=everyone/intervalのどちらかのキーワードで指定します。順に、ポポポ音を文字毎に鳴らす/文字に関係なく一定の間隔で鳴らす、を意味します。デフォルトはeveryone。,
noplaychars=modeがeveryoneの場合のみ機能します。ポポポ音を鳴らさない文字を指定できます。デフォルトは"…・、。「」（）　 "。,
interval=modeがintervalの場合のみ機能します。ポポポ音を鳴らす間隔をミリ秒で指定します。デフォルトは80。,
chara=キャラクター名を指定できます。このキャラクターが話しているときだけ、ポポポ音を適用できます。

#[end]
*/

tyrano.plugin.kag.tag.popopo = {
    
    pm: {
        volume: "",
        time: "",
        tailtime: "",
        frequency: "",
        octave: "",
        type: "",
        mode: "",
        buf: "",
        storage: "",
        samplerate: "",
        chara:"default",
    },
    
    start: function (pm) {
        
        // 音程の文字列と数値対応
        const FREQUENCY = {
            "A": 0,
            "A+": 100,
            "B": 200,
            "B+": 300,
            "C": 300,
            "C+": 400,
            "D": 500,
            "D+": 600,
            "E": 700,
            "E+": 800,
            "F": 800,
            "F+": 900,
            "G": 1000,
            "G+": 1100,
        };

        //# TYRANO.kag.stat.popopo
        let popopo = $.extend(true, {}, this.kag.stat.popopo);
        
        if (pm.chara != "") {
            if (this.kag.stat.popopo_chara[pm.chara]) {
                popopo = this.kag.stat.popopo_chara[pm.chara];
            }
        }
        
        var f = 0, is_set = false;
        if (pm.volume !== "") popopo.volume = pm.volume;
        if (pm.time !== "") popopo.time = parseInt(pm.time) / 1000;
        if (pm.tailtime !== "") popopo.time = parseInt(pm.tailtime) / 1000;
        if (pm.frequency !== "") popopo.frequency = FREQUENCY[pm.frequency];
        if (pm.octave !== "") popopo.octave = parseInt(pm.octave);
        if (pm.type !== "") popopo.type = pm.type;
        if (pm.mode !== "") popopo.mode = pm.mode;
        if (pm.buf !== "") popopo.buf = pm.buf;
        if (pm.storage !== "") popopo.storage = pm.storage;
        if (pm.samplerate !== "") popopo.samplerate = parseInt(pm.samplerate);
        if (typeof pm.noplaychars === "string") popopo.noplaychars = pm.noplaychars;
        
        popopo.enable = true;
        
        this.kag.stat.popopo.enable = true; //ポポポが有効化どうか
        
        this.kag.stat.popopo_chara[pm.chara] = popopo;
        
        this.kag.ftag.nextOrder();
            
    }
};

//ポポポ初期化
//# TYRANO.kag.popopo
tyrano.plugin.kag.popopo = {
    kag: TYRANO.kag,
    is_ready: false
};

tyrano.plugin.kag.popopo.init = function () {
    
    TYRANO.kag.popopo.is_ready = true;
    
    // oscillatorNode.typeの文字列と数値対応
    const TYPE_TO_NUMBER = {
        "sine": 0,
        "square": 1,
        "sawtooth": 2,
        "triangle": 3
    };
    
    // AudioContext
    var AudioContext = window.AudioContext || window.webkitAudioContext;

    // AudioContextが偽の場合はここで終了する
    if (!AudioContext) {
        return;
    }

    TYRANO.kag.popopo.audioContext = new AudioContext();
    TYRANO.kag.popopo.audioContext.createGain = TYRANO.kag.popopo.audioContext.createGain || TYRANO.kag.popopo.audioContext.createGainNode;
    TYRANO.kag.popopo.gainNode = TYRANO.kag.popopo.audioContext.createGain();
    TYRANO.kag.popopo.gainNode.gain.value = 0;
    TYRANO.kag.popopo.gainNode.connect(TYRANO.kag.popopo.audioContext.destination);

    //# TYRANO.kag.popopo.file
    TYRANO.kag.popopo.file = {
        everyone: {
            start: function (message_str, ch_speed) {
            },
            play: function (ch) {
                var pm = TYRANO.kag.stat.popopo;
                
                if (pm.noplaychars.indexOf(ch) > -1) return;
                var volume = pm.volume;
                if (volume === "default") {
                    volume = "";
                }
                TYRANO.kag.ftag.startTag("playse", {
                    volume: volume,
                    buf: pm.buf,
                    storage: pm.storage,
                    stop: true
                });
            },
            stop: function (message_str, ch_speed) {
            }
        },
        interval: {
            start: function (message_str, ch_speed) {
                var pm = TYRANO.kag.stat.popopo;
                if (pm.volume === "default") {
                    pm.volume = "";
                }
                var interval = pm.interval || 100;
                var count = Math.ceil(message_str.length * ch_speed / interval);
                var i = 0;
                var play = function () {
                    TYRANO.kag.ftag.startTag("playse", {
                        volume: pm.volume,
                        buf: pm.buf,
                        storage: pm.storage,
                        stop: true
                    });
                    if (++i >= count) {
                        clearInterval(TYRANO.kag.popopo_timer);
                    }
                }
                clearInterval(TYRANO.kag.popopo_timer);
                TYRANO.kag.popopo_timer = setInterval(play, interval);
                play();
            },
            play: function (ch) {
            },
            stop: function (message_str, ch_speed) {
                clearInterval(TYRANO.kag.popopo_timer);
            }
        }
    };

    //# TYRANO.kag.popopo.createNode
    // オシレーターノードを作るぞ
    TYRANO.kag.popopo.createNode = function (pm) {
        if (pm.type === "noise") {
            return this.noise.createNoise(pm);
        }
        else {
            var node = this.audioContext.createOscillator();
            node.detune.value = pm.frequency + pm.octave * 1200;
            node.type = (typeof node.type === "string") ? pm.type : TYPE_TO_NUMBER[pm.type];
            node.start = node.start || node.noteOn;
            node.stop = node.stop || node.noteOff;
            node.connect(this.gainNode);
            node.start();
            return node;
        }
    };

    //# TYRANO.kag.popopo.createNoise
    // オシレーターノード（ノイズ）を作る
    TYRANO.kag.popopo.noise = {
        cache: {},
        createNoise: function (pm) {
            var audioContext = TYRANO.kag.popopo.audioContext;
            var sampleRate = Math.min(Math.max(3000, parseInt(pm.samplerate) || 44000), 192000);
            var noiseBuffer;
            if (this.cache[sampleRate]) {
                noiseBuffer = this.cache[sampleRate];
            }
            else {
                var bufferSize = audioContext.sampleRate;
                noiseBuffer = audioContext.createBuffer(1, bufferSize, sampleRate);
                var output = noiseBuffer.getChannelData(0);
                for (var i = 0; i < bufferSize; i++) {
                    output[i] = Math.random() * 2 - 1;
                }
                this.cache[sampleRate] = noiseBuffer;
            }
            var whiteNoise = audioContext.createBufferSource();
            whiteNoise.buffer = noiseBuffer;
            whiteNoise.loop = true;
            whiteNoise.start(0);
            whiteNoise.connect(TYRANO.kag.popopo.gainNode);
            whiteNoise.stop = function () {
                whiteNoise.disconnect();
            };
            return whiteNoise;
        }
    };

    //# TYRANO.kag.popopo.wave
    // 音声を生成・再生・終了する
    TYRANO.kag.popopo.wave = {
        // 文字毎
        everyone: {
            start: function (message_str, ch_speed) {
                var pm = TYRANO.kag.stat.popopo;
                
                if (pm.volume === "default") {
                    pm._volume = parseInt(TYRANO.kag.config.defaultSeVolume) / 100;
                }
                else {
                    pm._volume = parseInt(pm.volume) / 100;
                }
                
                TYRANO.kag.popopo.oscillatorNode = TYRANO.kag.popopo.createNode(pm);
            },
            play: function (ch) {
                var t0 = TYRANO.kag.popopo.audioContext.currentTime;
                var pm = TYRANO.kag.stat.popopo;
                
                if (pm.noplaychars.indexOf(ch) > -1) return;
                
                TYRANO.kag.popopo.gainNode.gain.setTargetAtTime(pm._volume, t0, 0);
                TYRANO.kag.popopo.gainNode.gain.setTargetAtTime(0, t0 + pm.time, pm.tailtime);
            },
            stop: function (message_str, ch_speed) {
                var t0 = TYRANO.kag.popopo.audioContext.currentTime;
                var pm = TYRANO.kag.stat.popopo;
                TYRANO.kag.popopo.gainNode.gain.setTargetAtTime(0, t0 + pm.time, pm.tailtime);
                TYRANO.kag.popopo.oscillatorNode.stop(t0 + pm.tailtime);
                TYRANO.kag.popopo.oscillatorNode = null;
            }
        },
        // 定間隔
        interval: {
            start: function (message_str, ch_speed) {
                var pm = TYRANO.kag.stat.popopo;
                if (pm.volume === "default") {
                    pm._volume = parseInt(TYRANO.kag.config.defaultSeVolume) / 100;
                }
                else {
                    pm._volume = parseInt(pm.volume) / 100;
                }
                TYRANO.kag.popopo.oscillatorNode = TYRANO.kag.popopo.createNode(pm);
        
                var t0 = TYRANO.kag.popopo.audioContext.currentTime;
                var gainNode = TYRANO.kag.popopo.gainNode;
                var interval = pm.interval || 100;
                var count = Math.ceil(message_str.length * ch_speed / interval);
                interval /= 1000;
                var t = t0;
                for (var i = 0; i < count; i++) {
                    gainNode.gain.setTargetAtTime(pm._volume, t, 0);
                    gainNode.gain.setTargetAtTime(0, t + pm.time, pm.tailtime);
                    t += interval;
                }
            },
            play: function (ch) {
            },
            stop: function (message_str, ch_speed) {
                var t0 = TYRANO.kag.popopo.audioContext.currentTime;
                var pm = TYRANO.kag.stat.popopo;
                var gainNode = TYRANO.kag.popopo.gainNode;
                TYRANO.kag.popopo.oscillatorNode.stop(t0 + pm.time);
                TYRANO.kag.popopo.oscillatorNode = null;
            }
        }
    };

    tyrano.plugin.kag.tag.configdelay.start = function (pm) {
        if (pm.speed != "") {
            this.kag.stat.ch_speed = "";
            this.kag.config.chSpeed = pm.speed;
            this.kag.ftag.startTag("eval", { "exp": "sf._config_ch_speed = " + pm.speed });
        } else {
            this.kag.ftag.nextOrder();
        }
    };

};



