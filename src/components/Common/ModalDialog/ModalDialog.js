import React, {Component} from 'react';
import {observer, inject} from 'mobx-react';
import Modal from 'react-modal';
import _ from 'lodash';
import CSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';
import {MODAL_TYPES} from './ModalStore';
import './ModalDialog.scss';

const noBackdropStyle = {
  overlay: {
    backgroundColor: 'transparent',
    pointerEvents: 'none',
    zIndex: 1080
  }
};

const transparentBackdropStyle = {
  overlay: {
    backgroundColor: 'transparent'
  }
};

@inject('modalStore')
@observer
export default class ModalDialog extends Component {
  close = () => {
    this.props.modalStore.close(true);
    document.body.classList.remove('substrate-open');
  };

  dismiss = () => {
    this.props.modalStore.close(false);
    document.body.classList.remove('substrate-open');
  };

  render() {
    const {isOpen, noBackdrop, modalType, modalClassName, title, body} = this.props.modalStore;
    if (isOpen) {
      document.body.classList.add('substrate-open');
    }
    return (
      <Modal
        isOpen={isOpen}
        onRequestClose={this.dismiss}
        closeTimeoutMS={250}
        style={noBackdrop ? noBackdropStyle : transparentBackdropStyle}
        className={`modal ${modalClassName}`}
        contentLabel={''}>
        <div className="modal-dialog">
          <CSSTransitionGroup
            className="transition-container"
            transitionName="rotate-in-out"
            transitionEnter={true}
            transitionLeave={true}
            transitionAppear={true}
            transitionAppearTimeout={350}
            transitionEnterTimeout={350}
            transitionLeaveTimeout={350}>
            {isOpen &&
            <div className="modal-content">
              <div className="modal-header">
                <button
                  type="button"
                  className="close"
                  onClick={this.dismiss}>
                  &times;
                </button>
                <h3 className="modal-title">
                  {title}
                </h3>
              </div>
              {modalType === MODAL_TYPES.custom &&
              <div className="modal-custom-body">
                {body}
              </div>
              }
              {modalType !== MODAL_TYPES.custom &&
              <div>
                <div className="modal-body">
                  {_.isArray(body) ? body.map(item => <p key={item}>{item}</p>) : body}
                </div>
                <div className="modal-footer">
                  <button
                    className="btn btn-primary"
                    type="button"
                    onClick={this.close}>
                    OK
                  </button>
                  {modalType === MODAL_TYPES.confirm &&
                  <button
                    className="btn btn-default"
                    type="button"
                    onClick={this.dismiss}>
                    Cancel
                  </button>
                  }
                </div>
              </div>
              }
            </div>
            }
          </CSSTransitionGroup>
        </div>
      </Modal>
    );
  }
}
