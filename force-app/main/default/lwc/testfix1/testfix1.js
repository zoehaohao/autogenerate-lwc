import { LightningElement, api } from 'lwc';

export default class Testfix1 extends LightningElement {
    @api recordId;
    
    connectedCallback() {
        console.log('Component initialized');
    }
}