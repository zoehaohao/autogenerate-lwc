import { LightningElement, api, track } from 'lwc';

export default class Testmymetrics1 extends LightningElement {
    @track totalRecords = 0;
    @track activeRecords = 0;
    @track successRate = 0;

    @api
    refresh() {
        // Method that can be called by parent to refresh metrics
        this.loadMetrics();
    }

    connectedCallback() {
        // Load initial metrics when component is inserted into the DOM
        this.loadMetrics();
    }

    loadMetrics() {
        // Simulate loading metrics - replace with actual data fetching
        this.totalRecords = Math.floor(Math.random() * 1000);
        this.activeRecords = Math.floor(this.totalRecords * 0.8);
        this.successRate = Math.floor((this.activeRecords / this.totalRecords) * 100);
    }

    handleRefresh() {
        this.loadMetrics();
    }

    handleExport() {
        // Implement export functionality
        const metrics = {
            totalRecords: this.totalRecords,
            activeRecords: this.activeRecords,
            successRate: this.successRate
        };
        
        // Create and trigger download of metrics data
        const dataStr = JSON.stringify(metrics, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', 'metrics.json');
        linkElement.click();
    }
}