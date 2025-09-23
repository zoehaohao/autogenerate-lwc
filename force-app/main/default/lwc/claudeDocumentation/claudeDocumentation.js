import { LightningElement, track } from 'lwc';

export default class ClaudeDocumentation extends LightningElement {
    @track activeSection = '';
    @track tableOfContents = [
        { id: 'overview', title: 'Overview', href: '#overview' },
        { id: 'installation', title: 'Installation', href: '#installation' },
        { id: 'usage', title: 'Usage Guide', href: '#usage' },
        { id: 'api', title: 'API Reference', href: '#api' },
        { id: 'examples', title: 'Code Examples', href: '#examples' },
        { id: 'troubleshooting', title: 'Troubleshooting', href: '#troubleshooting' }
    ];

    @track documentationSections = [
        {
            id: 'overview',
            title: 'Overview',
            content: '<p>Claude is an advanced AI assistant capable of understanding and generating code. This documentation provides comprehensive information about Claude\'s code-related capabilities and integration methods.</p>'
        },
        {
            id: 'installation',
            title: 'Installation',
            content: '<p>Integration with Claude requires proper setup and authentication. Follow these steps to get started:</p><ul><li>Obtain API credentials</li><li>Configure environment variables</li><li>Install required dependencies</li></ul>'
        },
        {
            id: 'usage',
            title: 'Usage Guide',
            content: '<p>Learn how to effectively use Claude for code generation, analysis, and documentation:</p>',
            codeExample: `// Example API call
const response = await claude.generateCode({
    prompt: "Create a function that sorts an array",
    language: "javascript",
    maxTokens: 500
});`
        },
        {
            id: 'api',
            title: 'API Reference',
            content: '<p>Detailed documentation of all available API endpoints and methods.</p>'
        },
        {
            id: 'examples',
            title: 'Code Examples',
            content: '<p>Practical examples demonstrating Claude\'s code capabilities:</p>',
            codeExample: `// Code generation example
const result = await claude.analyze({
    code: sourceCode,
    type: "security_review"
});`
        },
        {
            id: 'troubleshooting',
            title: 'Troubleshooting',
            content: '<p>Common issues and their solutions, debugging tips, and best practices.</p>'
        }
    ];

    connectedCallback() {
        this.updateActiveSection();
        window.addEventListener('scroll', this.handleScroll.bind(this));
    }

    disconnectedCallback() {
        window.removeEventListener('scroll', this.handleScroll.bind(this));
    }

    handleScroll() {
        this.updateActiveSection();
    }

    updateActiveSection() {
        const sections = this.template.querySelectorAll('.doc-sections .slds-box');
        let currentSection = '';
        
        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            if (rect.top <= 100) {
                currentSection = section.dataset.id;
            }
        });

        this.activeSection = currentSection;
        this.updateNavClasses();
    }

    updateNavClasses() {
        this.tableOfContents = this.tableOfContents.map(item => ({
            ...item,
            navClass: `slds-nav-vertical__action ${item.id === this.activeSection ? 'slds-is-active' : ''}`
        }));
    }

    handleNavigation(event) {
        event.preventDefault();
        const sectionId = event.currentTarget.dataset.section;
        const section = this.template.querySelector(`[data-id="${sectionId}"]`);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
        }
    }
}