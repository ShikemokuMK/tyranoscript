//イベント管理用のクラス
tyrano.plugin.kag.event = {
    tyrano: null,

    init: function () {
        //alert("kag.order 初期化");
        //this.tyrano.test();
        //同じディレクトリにある、KAG関連のデータを読み込み
    },

    //イベント用のエレメントを設定する
    addEventElement: function (obj) {
        var j_obj = obj.j_target;

        j_obj.addClass("event-setting-element");
        j_obj.attr("data-event-target", obj.target);
        j_obj.attr("data-event-storage", obj.storage);
        j_obj.attr("data-event-tag", obj.tag);

        //パラメータを格納してみてはどうか？
        j_obj.attr("data-event-pm", JSON.stringify(obj.pm));
    },

    /**
     * 受け取ったjQueryオブジェクトのイベントを削除
     * ロードで復元されないようにする
     * @param {jQuery} j_obj
     */
    removeEventAttr: function (j_obj) {
        j_obj
            .removeClass("event-setting-element")
            .removeAttr("data-event-target")
            .removeAttr("data-event-storage")
            .removeAttr("data-event-tag")
            .removeAttr("data-event-pm");
    },

    /**
     * 任意のタグをロード時に再び実行するようにする
     * options = {
     *   tag: string;
     *   pm: { [key: string]: string };
     * }
     * @param {JQuery<HTMLElement>} j_obj - 対象の要素
     * @param {string} tag - タグ名
     * @param {Object} pm - パラメータ
     */
    addRestoreData: function (j_obj, tag, pm) {
        // data-restore属性を取得
        const restore_data_str = j_obj.attr("data-restore");

        // 配列に直す
        let restore_data;
        if (typeof restore_data_str === "string") {
            restore_data = JSON.parse(restore_data_str);
        } else {
            restore_data = [];
        }

        // 新しいデータを追加して、再びdata-restore属性に戻す
        restore_data.push({ tag, pm });
        j_obj.attr("data-restore", JSON.stringify(restore_data));
    },

    /**
     * 指定されたタグ名に一致する復元用データを削除する
     * タグ名が指定されていない場合はすべての復元用データを削除する
     * @param {JQuery<HTMLElement>} j_obj - 対象の要素
     * @param {string} [tag] - タグ名
     */
    removeRestoreData: function (j_obj, tag) {
        const restore_data_str = j_obj.attr("data-restore");

        // 復元用データが存在しない場合はなにもしない
        if (!restore_data_str) {
            return;
        }

        // タグが指定されていない場合はすべての復元用データを削除する
        if (!tag) {
            j_obj.removeAttr("data-restore");
            return;
        }

        // 指定されたタグに一致しない復元用データを選別する
        const restore_data = JSON.parse(restore_data_str);
        const filterd_data = restore_data.filter((item) => item.tag !== tag);

        // 選別して残ったものがあるならそれでdata-restore属性を上書き、なにも残らなければ属性ごと削除
        if (filterd_data.length > 0) {
            j_obj.attr("data-restore", JSON.stringify(filterd_data));
        } else {
            j_obj.removeAttr("data-restore");
        }
    },
};
