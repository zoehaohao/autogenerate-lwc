import { LightningElement } from 'lwc';

export default class Helloworld3 extends LightningElement {
    greeting = 'World';
    
    handleClick() {
        this.greeting = this.greeting === 'World' ? 'Salesforce' : 'World';
    }
}