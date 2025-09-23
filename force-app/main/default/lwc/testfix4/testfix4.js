import { LightningElement, api } from 'lwc';

export default class Testfix4 extends LightningElement {
    @api recordId;
    
    connectedCallback() {
        console.log('Testfix4 component initialized');
    }
}