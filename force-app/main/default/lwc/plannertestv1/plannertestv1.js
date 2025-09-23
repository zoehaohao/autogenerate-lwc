import { LightningElement, api } from 'lwc';

export default class Plannertestv1 extends LightningElement {
    @api recordId;
    
    connectedCallback() {
        // Component initialization logic
        console.log('Planner Test V1 Initialized');
    }
}