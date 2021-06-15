function normalizeUrl(url) {
	return url.endsWith('/') ? url : url + '/';
}

function getPrerenderdata(value, props) {
	if (
		value &&
		value.url &&
		normalizeUrl(props.url) === normalizeUrl(value.url)
	) {
		return value;
	}
	return null;
}

function checkProps(props) {
	if (!('url' in props)) {
		throw new Error(
			'The prerender-data provider expects current URL in props. This is required to give the pre-render data to the correct instance only.'
		);
	}
}

function getUrlFromProps(props) {
	let url = props.path;
	Object.entries(props.matches).forEach(([key, path]) => {
		url = url.replace(`:${key}`, path);
	});
	return url;
}

export { normalizeUrl, getPrerenderdata, checkProps, getUrlFromProps };
