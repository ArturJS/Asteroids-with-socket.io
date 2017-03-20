function pathModifier() {
	return process.argv.indexOf('--replaceWithJspExtensions') > -1 ? '/static/' : '';
}

function getReplacingParams() {
	if (process.argv.indexOf('--replaceWithJspExtensions') > -1) {
		return [
			{
				pattern: /<!--\s*SETTINGS\s+CONFIG\s*-->/g,
				replacement: '<script th:inline="javascript">\n' +
				'/*<![CDATA[*/\n' +
				'window.CONFIG = {\n' +
				'partner:/*[[${partner}]]*/,\n' +
				'captchaKey: /*[[${captchaKey}]]*/,\n' +
				'serviceUrl: /*[[${serviceUrl}]]*/ \'http://10.66.131.74:8765/onboarding\',\n' +
				'};\n' +
				'/*]]>*/\n' +
				'</script>'
			},
			{
				pattern: /<!--\s*THEMES\s+PLACEHOLDER\s*-->(\s|.)*<!--\s*\/THEMES\s+PLACEHOLDER\s*-->/g,
				replacement: '<link rel="stylesheet" th:remove="${partner} ? none : all" th:href="\'/themes/\'+${partner}+\'/styles.css?_=\'+${cacheprevent}"/>'
			}
		];
	}
	return [];
}

module.exports = {
	getReplacingParams: getReplacingParams,
	pathModifier: pathModifier
};
