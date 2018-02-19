/** @format */

/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import FormLabel from 'src/ui/components/form-label';
import CompactCard from 'src/ui/components/card/compact';
import Card from 'src/ui/components/card';

export class MessageForm extends React.Component {
	render() {
		const { message } = this.props;
		return (
			<div className="message-form">
				<CompactCard>
					<p className="message-form__header-title">Contact Us</p>
				</CompactCard>
				<Card>
					<FormLabel>{ message }</FormLabel>
				</Card>
			</div>
		);
	}
}

MessageForm.propTypes = {
	message: PropTypes.string,
};

MessageForm.defaultProps = {
	message: 'We are having problems to offer support at the moment. Please, bear with us.',
};