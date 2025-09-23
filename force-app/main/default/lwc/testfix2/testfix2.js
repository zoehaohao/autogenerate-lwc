import { LightningElement, api } from 'lwc';

export default class Testfix2 extends LightningElement {
    @api recordId;
    
    connectedCallback() {
        console.log('Testfix2 component initialized');
    }
}