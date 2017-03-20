import React, {Component, PropTypes} from 'react';
import {observer} from 'mobx-react';
import './Form.scss';

@observer
export default class Form extends Component {
	static propTypes = {
		store: PropTypes.object.isRequired,
		children: PropTypes.any.isRequired,
		onSubmit: PropTypes.func,
		className: PropTypes.string
	};

	static childContextTypes = {
		store: PropTypes.object
	};

	getChildContext() {
		return {
			store: this.props.store
		};
	}

	render() {
		let {onSubmit, children, className} = this.props;

		return (
			<form onSubmit={onSubmit} className={className}>
				{children}
			</form>
		);
	}
}
