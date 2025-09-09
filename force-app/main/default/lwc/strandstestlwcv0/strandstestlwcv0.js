import { LightningElement, api } from 'lwc';

export default class Strandstestlwcv0 extends LightningElement {
    @api recordId;
    
    connectedCallback() {
        // Component initialization logic
        console.log('Component initialized');
    }
}