import html from './template.html';

// typescript annotations for the elements we select from the template
interface FactorLabelListTemplateElements {
  entry: HTMLTemplateElement;
  list: HTMLOListElement;
}

// ts annotation for rules in progress. users may not have entered both (or either) value yet
type Rule = [number?, string?];

const DEFAULT_RULES: Rule[] = [
  [3, 'Fizz'],
  [5, 'Buzz'],
  [undefined, undefined]
];

class FactorLabelList extends HTMLElement {
  private els: FactorLabelListTemplateElements;
  private rules: Rule[];

  // approximately like `componentDidMount`, `jQuery.ready`, 'DOMContentReady' event
  constructor() {
    super();

    // initialize component-scoped `document`-like object
    var doc = this.attachShadow({ mode: 'closed' });
    // evaluate the template HTML into DOM
    var tpl = document.createElement('template');
    tpl.innerHTML = html;
    doc.appendChild(tpl.content.cloneNode(true));

    // store elements pertinent to rendering
    this.els = {
      entry: doc.getElementById('entry'),
      list: doc.getElementById('list')
    } as FactorLabelListTemplateElements;

    // bind controls
    doc.getElementById('add')!.addEventListener('click', this.addRule);

    this.rules = DEFAULT_RULES;
    this.render();
    this.signalChange();
  }

  // clicked add button, put up an empty row
  addRule() {
    this.rules.push([undefined, undefined]);
    this.render();
  }

  // parse rules out of attribute JSON if provided
  static get observedAttributes(): string[] {
    return ['rules'];
  }

  // parse rules out of attribute JSON if provided, cont.
  async attributeChangedCallback(
    attr: 'rules',
    oldValue?: string,
    newValue?: string
  ): Promise<void> {
    if (newValue !== oldValue) {
      this.rules = JSON.parse(newValue || '[]');
      this.render();
    }
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
    this.els.list.innerHTML = '';
    this.rules.forEach(([num, lbl], idx) => {
      let item = this.els.entry.content.cloneNode(true) as Element

      // fill data
      ['number', 'label'].forEach(type =>
        item.querySelectorAll(`.value-of-${ type }`)
          .forEach((el: Element) => {
            if (!(el instanceof HTMLInputElement))
              return

            // reflect state
            el.value = ((type == 'number' ? num : lbl) || '').toString()

            // bind events
            el.onchange = () => {
              if (type === 'number') {
                this.rules[idx][0] = parseInt(el.value)
              }
              else {
                this.rules[idx][1] = el.value
              }
              this.signalChange()
            }
          })
      )

      // bind events
      item.querySelectorAll('.remove')
        .forEach(el =>
          el.addEventListener('click', (evt) => {
            this.rules = this.rules.splice(idx, 1)
            this.render()
            this.signalChange()
          })
        )

      this.els.list.appendChild(item)
    });
  }
}
window.customElements.define('fb-factor-label-list', FactorLabelList);
