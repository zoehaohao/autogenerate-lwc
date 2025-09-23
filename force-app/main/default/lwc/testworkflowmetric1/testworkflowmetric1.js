import { LightningElement, api, track } from 'lwc';

export default class Testworkflowmetric1 extends LightningElement {
    @api totalTasks = 0;
    @api completedTasks = 0;
    
    get pendingTasks() {
        return this.totalTasks - this.completedTasks;
    }
    
    get progressValue() {
        if (this.totalTasks === 0) return 0;
        return (this.completedTasks / this.totalTasks) * 100;
    }
}