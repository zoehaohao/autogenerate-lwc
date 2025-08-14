import { LightningElement, api } from 'lwc';

export default class StrandsTestV6Child extends LightningElement {
    @api message;

    handleReply() {
        const replyEvent = new CustomEvent('messagechange', {
            detail: 'Reply from child component'
        });
        this.dispatchEvent(replyEvent);
    }
}