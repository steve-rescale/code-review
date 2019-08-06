import { html, render } from 'lit-html';
import { produce } from 'immer';

// ts annotation for rules in progress. users may not have entered both (or either) value yet
type Rule = [number?, string?];

const DEFAULT_RULES: Rule[] = [
  [3, 'Fizz'],
  [5, 'Buzz'],
  [undefined, undefined]
];

class FactorLabelRules extends HTMLElement {
  // initialize component-scoped `document`-like object
  private root?: ShadowRoot = this.attachShadow({ mode: 'closed' });
  rules: Rule[];

  updateRule?: (which: number, idx: number) => ((evt: Event) => void);

  // approximately like `componentDidMount`, `jQuery.ready`, 'DOMContentReady' event
  constructor() {
    super();

    this.rules = DEFAULT_RULES;
  }

  connectedCallback() {
    this.render();
    this.signalChange();
  }

  // clicked add button, put up an empty row
  addRule() {
    this.rules.push([undefined, undefined]);
    this.render();
  }

  removeRule = (idx: number) => {
    this.rules = this.rules.splice(idx, 1);
    this.signalChange();
    this.render();
  };

  static get observedAttributes(): string[] {
    return ['rules'];
  }

  async attributeChangedCallback(
    attr: 'rules',
    oldValue?: string | Rule[],
    newValue?: string | Rule[]
  ): Promise<void> {
    if (typeof newValue === 'string') {
      this.setAttribute('rules', JSON.parse(newValue));
    }
    this.render();
  }

  // notify listeners of the rules that are complete
  signalChange = (): void => {
    this.dispatchEvent(
      new CustomEvent('change', {
        detail: this.rules.filter(([num, lbl]) => num && lbl),
        composed: true
      })
    );
  }

  render() {
    return render(html`
      <ol id="list">
        ${
          this.rules.map(([num, lbl], idx) => html`
            <li>
              <input value="${ num || '' }" @change=${ this.updateRule!(idx, 0) }>
              <input value="${ lbl || '' }" @change=${ this.updateRule!(idx, 1) }>
              <button @click="${ () => this.removeRule(idx) }">Remove</button>
            </li>
          `)
        }
      </ol>
      <button @click="${ this.addRule }">Add
    `, this.root!);
  }
}

FactorLabelRules.prototype.updateRule = function updateRules(which: number, part: number) {
  return ({ currentTarget }: Event) => {
    if (!(currentTarget instanceof HTMLInputElement)) {
      return;
    }
    this.rules[which][part] = part === 0 ? parseInt(currentTarget.value) : currentTarget.value;
    this.signalChange();
  };
}

window.customElements.define('fb-factor-label-rules', FactorLabelRules);
