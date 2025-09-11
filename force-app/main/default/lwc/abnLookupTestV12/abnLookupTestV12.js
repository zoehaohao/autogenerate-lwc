import { LightningElement } from 'lwc';

export default class AbnLookupTestV12 extends LightningElement {
    inputValue = ''; // Added for new input field

    handleInputChange(event) {
        this.inputValue = event.target.value;
    }

    handleSelectionChange(event) {
        console.log('Selected record: ', event.detail);
    }
}