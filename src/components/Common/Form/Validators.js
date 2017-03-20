export const required = (error) => {
	return (value, values) => {
		if (!value) {
			return error;
		}
		return null;
	};
};
