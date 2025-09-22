import { LightningElement, api, track } from 'lwc';

export default class Testmymetrics2 extends LightningElement {
    @track metric1Value = 100;
    @track metric2Value = 200;
    @track metric3Value = 300;

    @api
    refreshMetrics() {
        // Method that can be called by parent to refresh metrics
        this.loadMetrics();
    }

    connectedCallback() {
        this.loadMetrics();
    }

    loadMetrics() {
        // Simulate loading metrics - in real implementation would call Apex
        this.metric1Value = Math.floor(Math.random() * 1000);
        this.metric2Value = Math.floor(Math.random() * 1000);
        this.metric3Value = Math.floor(Math.random() * 1000);
    }
}