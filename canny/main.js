'use strict';

function image_to_canvas(img, can) {
	can.width  = img.naturalWidth;
	can.height = img.naturalHeight;

	let ctx = can.getContext("2d");
	ctx.clearRect(-5, -5, can.width+10, can.height+10);
	ctx.drawImage(img, 0, 0);

	return ctx.getImageData(0, 0, can.width, can.height);
}

// http://www.pixelstech.net/article/1353768112-Gaussian-Blur-Algorithm
function gaussian_filter(image_data, filter_radius, use_alpha) {
	function weight_index(i, j) {
		return i*filter_radius + j;
	}
	
	let
		weight_map = new Float64Array(filter_radius*filter_radius),
		standard_deviation = filter_radius - 0.5, // theta
		c = 2 * standard_deviation * standard_deviation;

	// creates one quarter of the weight map, plus center columns/rows
	for (let i=0;i<filter_radius;i++) {
		for (let j=0;j<filter_radius;j++) {
			weight_map[weight_index(i, j)] = 1/(c*Math.PI*Math.exp((i*i + j*j)/c))
		}
	}
	
	let
		width    = image_data.width,
		height   = image_data.height,
		data     = image_data.data,
		filtered = new ImageData(width, height),
		filter_data = filtered.data;
	
	for (let i=0;i<height;i++) {
		for (let j=0;j<width;j++) {
			let r = 0, g = 0, b = 0, a = 0, missed = 0;
			let data_index = (i*width+j)*4;
			
			for (let l = 1 - filter_radius; l < filter_radius; l++) {
				for (let m = 1 - filter_radius; m < filter_radius; m++) {
					if (i + l < height && i + l >= 0 && j + m < width && j + m >= 0) {
						const index = data_index + (l*width+m)*4;
						const weight = weight_map[weight_index(Math.abs(l), Math.abs(m))];
						
						r += weight * data[index+0];
						g += weight * data[index+1];
						b += weight * data[index+2];
						a += weight * data[index+3];
					}
					else {
						missed++;
					}
				}
			}
			
			const mm = filter_radius*2 - 1;
			const miss_modifier = mm/(mm - missed);
			filter_data[data_index+0] = r*miss_modifier;
			filter_data[data_index+1] = g*miss_modifier;
			filter_data[data_index+2] = b*miss_modifier;
			filter_data[data_index+3] = use_alpha? a*miss_modifier : 255;
		}
	}

	return filtered;
}

let doc = null;
ready(() => {
	doc = prescript({
		file: {},
		btn_load: {
			click: () => {
				var get = file.files[0];
				var reader = new FileReader();

				reader.onload = function (e) {
					doc.image.src = e.target.result;
				}
				reader.readAsDataURL(get);
			}
		},
		btn_to_canvas: {
			click: () => {
				image_to_canvas(doc.image, doc.output);
			}
		},
		btn_filter: {
			click: () => {
				var ctx = doc.output.getContext("2d");
				var image_data = ctx.getImageData(0, 0, doc.output.width, doc.output.height);

				var filtered = gaussian_filter(
					image_data,
					parseInt(doc.in_filter_radius.value, 10), doc.in_alpha.checked
				);

				ctx.clearRect(-5, -5, doc.output.width+10, doc.output.height+10);
				ctx.putImageData(filtered, 0, 0);
			}
		},
		in_filter_radius: {},
		in_alpha: {},
		image: {},
		output: {}
	});

	// clear the file loader if it had something left over after a page refresh
	doc.file.value = "";
});
