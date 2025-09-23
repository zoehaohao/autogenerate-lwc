import { LightningElement, api } from 'lwc';

export default class Testfix3 extends LightningElement {
    @api recordId;
    
    connectedCallback() {
        // Component initialization logic
        console.log('Testfix3 component initialized');
    }
}