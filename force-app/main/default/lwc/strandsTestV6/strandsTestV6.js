import { LightningElement, track } from 'lwc';

export default class StrandsTestV6 extends LightningElement {
    @track inputValue = '';
    @track message = 'Initial Message';

    handleInputChange(event) {
        this.inputValue = event.target.value;
    }

    handleClick() {
        this.message = this.inputValue || 'No message entered';
    }

    handleMessageChange(event) {
        this.message = event.detail;
    }
}