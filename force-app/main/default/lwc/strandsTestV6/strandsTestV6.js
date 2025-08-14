import { LightningElement, track } from 'lwc';

export default class StrandsTestV6 extends LightningElement {
    @track inputName = '';
    @track displayMessage = '';
    @track messageForChild = '';

    handleNameChange(event) {
        this.inputName = event.target.value;
        this.messageForChild = `Hello ${this.inputName}!`;
    }

    handleClick() {
        if (this.inputName) {
            this.displayMessage = `Welcome, ${this.inputName}!`;
        } else {
            this.displayMessage = 'Please enter a name.';
        }
    }

    handleChildEvent(event) {
        const childMessage = event.detail;
        this.displayMessage = `Child says: ${childMessage}`;
    }
}