
//コンバート実行機能
class ThreeModel {

	constructor(obj, three) {

		/*
		this.name  = obj.name;
		this.model = obj.model;
		this.mixer = obj.mixer;
		this.gltf  = obj.gltf;
		this.pm    = obj.pm;
		*/

		this.three = three;

		for (let key in obj) {
			this[key] = obj[key];
		}

		this.model.name = obj.name;
		this.setUserData("name", obj.name);

		if (obj.pm.not_export) {
			this.setUserData("not_export", obj.pm.not_export);
		}

		if (this.pm.visible == "true") {

			this.show();

			three.scene.add(this.model);
		} else {
			this.visible = false;
			this.opacity(0);
		}

		this.model_helper;
		this.anim_obj = null;

	}

	//音楽ディレクトリと効果音ディレクトリの２つを変換する
	update(delte_time) {

		if (this.visible == false) return;

		if (this.mixer) {
			this.mixer.update(delte_time);
		}

	}

	setPosition(x, y, z) {
		this.model.position.set(x, y, z);

	}

	setScale(x, y, z) {

		this.model.scale.set(x, y, z);

	}

	setRotation(x, y, z) {

		this.model.rotation.set(x, y, z);

	}

	setOutline() {
		/*
		var hex  = 0xff0000;
		var bbox = new THREE.BoundingBoxHelper(this.model, hex );
		bbox.update();
		this.model.add( bbox );
		*/

		//console.log("ggggggggg");
		//console.log(this.model);

		//var axisHelper = new THREE.AxisHelper(50);
		//this.model.add( axisHelper );

		this.three.outlinePass.selectedObjects = [];
		this.three.outlinePass.selectedObjects.push(this.model);

	}

	fade(direction, options, cb) {

		options = options || {};
		// set and check 
		var from_opacity = (direction == "in") ? 0 : 1;
		var to_opacity = (from_opacity == 0) ? 1 : 0;

		if (direction == "in") {
			this.visible = true;
		}

		var easing = options.easing || "linear";
		var duration = options.duration || 1000;

		var j_obj = $("<input type='hidden'>");
		j_obj.css("opacity", from_opacity);

		var timer = j_obj.animate(
			{ "opacity": to_opacity },
			{
				duration: duration,
				easing: easing,
				step: (now, elem) => {
					this.opacity(now);
				},
				complete: () => {

					j_obj.remove();

					if (direction != "in") {
						this.visible = false;

					} else {
						this.visible = true;

					}

					if (typeof cb == "function") {
						cb(this.model);
					}

				}
			}

		);


		return;


	}

	setMotion(motion) {

		var animations = this.gltf.animations;

		var anim = animations.find((obj) => {

			return (obj.name == motion);

		});

		this.mixer = new THREE.AnimationMixer(this.model);
		const action = this.mixer.clipAction(anim);
		action.reset().play().fadeIn(0.5);

	}

	setVisible(visible) {

		if (visible == true) {
			this.opacity(1);
		} else {
			this.opacity(0);
		}

		this.visible = visible;
		this.model.visible = visible;

	}

	//ポジションを指定位置まで移動させる
	toAnim(type, pos, options, cb) {

		var setFunc = "setPosition";

		var to_pos = {};

		to_pos.x = pos.x || this.model[type].x;
		to_pos.y = pos.y || this.model[type].y;
		to_pos.z = pos.z || this.model[type].z;

		if (pos.x == 0) {
			to_pos.x = 0;
		}

		if (pos.y == 0) {
			to_pos.y = 0;
		}

		if (pos.z == 0) {
			to_pos.z = 0;
		}
		
		
		let from_pos = {
			x: this.model[type].x,
			y: this.model[type].y,
			z: this.model[type].z
		}

		//相対指定の場合
		if (options.relative == "true") {

			to_pos.x += from_pos.x;
			to_pos.y += from_pos.y;
			to_pos.z += from_pos.z;

		}

		this.anim_obj = anime({
			targets: from_pos,
			x: to_pos.x,
			y: to_pos.y,
			z: to_pos.z,
			round: 1000,
			duration: options.duration,
			easing: options.easing,
			direction: options.direction,
			loop: options.loop,
			update: (e) => {
				//console.log(from_pos);
				this.model[type]["x"] = from_pos.x;
				this.model[type]["y"] = from_pos.y;
				this.model[type]["z"] = from_pos.z;
			},

			complete: (e) => {
				if (typeof cb == "function") {
					cb();
				}
			}

		});

		return;

		//以下無効
		var arr = ["x", "y", "z"];
		var cnt_fin = 0;

		this.anim_obj[type] = {};

		for (var i = 0; i < arr.length; i++) {

			(() => {

				var key = arr[i];
				var j_obj = $("<input type='hidden'>");

				this.anim_obj[type][key] = { "key": key, "obj": j_obj };

				j_obj.css("left", this.model[type][key]);

				j_obj.animate(
					{ "left": to_pos[key] },
					{
						duration: options.duration,
						easing: options.easing,
						step: (now, elem) => {
							this.model[type][key] = now;
						},
						complete: () => {

							j_obj.remove();
							delete this.anim_obj[key];

							cnt_fin++;

							if (arr.length == cnt_fin) {
								if (typeof cb == "function") {
									cb();
								}
							}
						}
					}
				);

			})();

		}



	}

	stopAnim(finish) {
		
		if (this.anim_obj) {
			anime.remove(this.anim_obj);
			this.anim_obj = null;
		}
		
		return;

		for (let type in this.anim_obj) {

			for (let key in this.anim_obj[type]) {

				var anim_obj = this.anim_obj[type][key];

				if (finish == "true") {
					anim_obj.obj.stop(true, true);
				} else {
					anim_obj.obj.stop(true, false);
				}

			}

		}

	}


	opacity(val) {


		if (this.model.isMesh) {

			var mat = this.model.material;

			if (!Array.isArray(mat)) {
				mat = [mat];
			}

			for (var i = 0; i < mat.length; i++) {

				var node = mat[i];
				node.transparent = true;
				node.opacity = val;

			}

		} else {

			this.model.traverse(function (node) {
				if (node.isMesh) {
					node.material.transparent = true;
					node.material.opacity = val;
				}
			});

		}

	}

	show(opacity = 1) {

		this.opacity(opacity);

		this.visible = true;
		this.model.visible = true;

	}
	
	/*
	show() {

		if (typeof this.pm["opacity"] == "undefined" || this.pm["opacity"] == "") {
			this.opacity(1);
		} else {
			this.opacity(parseFloat(this.pm["opacity"]));
		}

		this.visible = true;
		this.model.visible = true;

	}
	*/



	setUserData(key, val) {

		this.model.traverse(function (node) {

			node.userData[key] = val;

		});


	}

	//アップデートが必要なときに呼び出す。
	needsUpdate() {

		this.model.traverse(function (node) {
			if (node.isMesh) {
				node.material.needsUpdate = true;
			}
		});

	}

	//tone 
	setToneMaped(flag) {

		this.model.traverse(function (node) {
			if (node.isMesh) {
				node.material.toneMapped = flag;
			}
		});

	}

	toSaveObj() {

		var obj = {};
		var m = this.model;

		obj["name"] = this.name;
		obj["pos"] = m.position.x + "," + m.position.y + "," + m.position.z;
		obj["rot"] = m.rotation.x + "," + m.rotation.y + "," + m.rotation.z;
		obj["scale"] = m.scale.x + "," + m.scale.y + "," + m.scale.z;

		obj.pm = this.pm;
		obj.pm["visible"] = this.visible;

		return obj;


	}


}
