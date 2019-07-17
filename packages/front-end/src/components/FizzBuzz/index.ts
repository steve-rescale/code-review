import html from './template.html';
import './FactorLabelList';

type CompleteRule = [number, string];

// typescript annotations for the elements we select from the template
interface FizzBuzzTemplateElements {
  entry: HTMLTemplateElement;
  list: HTMLOListElement;
  count: HTMLInputElement;
}

class FizzBuzz extends HTMLElement {
  private els: FizzBuzzTemplateElements;
  private rules?: CompleteRule[] = undefined;

  // approximately like `componentDidMount`, `jQuery.ready`, 'DOMContentReady' event
  constructor() {
    super();

    // initialize component-scoped `document`-like object
    var doc = this.attachShadow({ mode: 'closed' });
    // evaluate the template HTML into DOM
    var tpl = document.createElement('template');
    tpl.innerHTML = html;
    doc.appendChild(tpl.content.cloneNode(true));

    /* store elements pertinent to rendering */
    this.els = {
      entry: doc.getElementById('entry'),
      list: doc.getElementById('list'),
      count: doc.getElementById('count')
    } as FizzBuzzTemplateElements;

    // bind controls
    this.els.count.addEventListener('change', this.countChanged);
    doc.getElementById('rules')!.addEventListener('change', this.rulesChanged);
  }

  // our attributes are like props from react in that they may be passed in through the markup specifying the component,
  // but they're also like state in that we are allowed to modify them ourselves
  countChanged = ({ currentTarget } : Event) =>
    this.setAttribute('count', (currentTarget as HTMLInputElement).value);

  rulesChanged = (evt: Event) => {
    if (!(evt instanceof CustomEvent)) {
      return;
    }
    this.rules = evt.detail;
    this.render();
  }

  // list of attributes with reactive behavior
  static get observedAttributes(): string[] {
    return ['count'];
  }

  // `componentWillReceiveProps`
  attributeChangedCallback(
    attr: 'count',
    oldValue?: string,
    newValue?: string
  ) {
    // don't do anything if value didn't change
    if (oldValue == newValue) {
      return;
    }
    this.els.count.value = parseInt(newValue || '1').toString();
    this.render();
  }

  render(num?: number): void {
    let count = parseInt(this.els.count.value, 10);
    this.els.list.innerHTML = '';
    for (let idx = 1; idx <= count; ++idx) {
      const item = this.els.entry.content.cloneNode(true) as Element;
      this.callApi(idx).then(x => {
        item.querySelectorAll('.fill-label')
          .forEach(y =>
            y.innerHTML = x.results[0]
          )
          this.els.list.appendChild(item)
      });
    }
  }

  /**
   * Get the label for the given number
   * @param {number} num - number to query
   * @return string
   */
  private async callApi(num: number): Promise<{ results: string[] }> {
    return (await fetch(
      'http://' + location.host + '/api/v1/fizz-buzz?start=' + num.toString() + '&end=' + num.toString() + '&rules=' + JSON.stringify(this.rules)
    )).json();
  }
}
window.customElements.define('fizz-buzz', FizzBuzz);
