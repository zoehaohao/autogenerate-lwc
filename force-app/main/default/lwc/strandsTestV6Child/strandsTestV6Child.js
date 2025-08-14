import { LightningElement, api } from 'lwc';

export default class StrandsTestV6Child extends LightningElement {
    @api processedText;

    notifyParent() {
        const evt = new CustomEvent('childevent', {
            detail: 'Message from child component'
        });
        this.dispatchEvent(evt);
    }
}