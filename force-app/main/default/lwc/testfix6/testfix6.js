import { LightningElement, api } from 'lwc';

export default class Testfix6 extends LightningElement {
    @api recordId;
    
    connectedCallback() {
        console.log('Component initialized');
    }
}