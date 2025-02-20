import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import MessengerCustomerChat from 'react-messenger-customer-chat';

export default class Example extends Component {
  render() {
    return (
      <MessengerCustomerChat
        pageId="475349145651536"
        appId="1759059694904661"
        themeColor="#0084ff"
        greetingDialogDisplay="show"
      />
    );
  }
}

