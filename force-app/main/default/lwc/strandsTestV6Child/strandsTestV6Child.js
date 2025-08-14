import { LightningElement, api } from 'lwc';

export default class StrandsTestV6Child extends LightningElement {
    @api message;

    handleClick() {
        const childEvent = new CustomEvent('childevent', {
            detail: 'Message from child component!'
        });
        this.dispatchEvent(childEvent);
    }
}