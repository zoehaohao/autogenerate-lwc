import { LightningElement, track } from 'lwc';
import processData from '@salesforce/apex/testRegenerationV0Controller.processData';

export default class TestRegenerationV0 extends LightningElement {
    @track inputValue = '';
    @track result;
    @track error;

    handleInputChange(event) {
        this.inputValue = event.target.value;
    }

    handleSearch() {
        if (!this.inputValue) {
            return;
        }

        processData({ input: this.inputValue })
            .then(result => {
                this.result = result;
                this.error = undefined;
                this.dispatchEvent(new CustomEvent('success', {
                    detail: {
                        message: 'Operation completed successfully'
                    }
                }));
            })
            .catch(error => {
                this.error = error.message;
                this.result = undefined;
                this.dispatchEvent(new CustomEvent('error', {
                    detail: {
                        message: error.message
                    }
                }));
            });
    }
}