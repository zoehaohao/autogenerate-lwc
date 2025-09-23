import { LightningElement, api } from 'lwc';

export default class Testfix5 extends LightningElement {
    @api recordId;
    
    connectedCallback() {
        // Component initialization logic
        console.log('Component initialized');
    }
}