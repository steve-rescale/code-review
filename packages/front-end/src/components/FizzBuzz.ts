import './FactorLabelRules';
import style from '../style.css';
import { html, render } from 'lit-html';

// like [3, 'foo'] or [5, 'bar'] in the default problem -- neither part undefined
type CompleteRule = [number, string];

class FizzBuzz extends HTMLElement {
  private rules?: CompleteRule[] = undefined;
  // initialize component-scoped `document`-like object
  private root = this.attachShadow({ mode: 'closed' });

  static get observedAttributes(): string[] {
    return ['count'];
  }

  // event handlers
  countChanged = ({ currentTarget } : Event) =>
    this.setAttribute('count', (currentTarget as HTMLInputElement).value);

  rulesChanged = (evt: Event) => {
    if (!(evt instanceof CustomEvent)) {
      return;
    }
    this.rules = evt.detail;
    this.render();
  }

  attributeChangedCallback(
    attr: 'count',
    oldValue?: string,
    newValue?: string
  ) {
    if (oldValue != newValue) {
      this.render();
    }
  }

  render(): void {
    render(html`
      <style>${style}</style>
      <label>Count:
        <input value="${ this.getAttribute('count') }" @change=${ this.countChanged }>
        <fb-factor-label-rules id="rules" @change=${ this.rulesChanged }></fb-factor-label-rules>
      </label>
      <center>
        <ul id="list"></ul>
      </center>
    `, this.root);
    this.addListItems(this.root.querySelectorAll('#list')[0]);
  }

  addListItems(list: Element): void {
    if (!(list instanceof HTMLElement)) {
      return;
    }
    list.innerHTML = '';
    var count = parseInt(this.getAttribute('count')!);
    for (var idx = 1; idx < count; idx = idx + 1) {
      this.callApi(idx).then(x => {
        const li = document.createElement('li');
        li.innerText = x.results[0];
        list.appendChild(li);
      })
    }
  }

  /**
   * Get the label for the given number
   * @param {number} num - number to query
   * @return string
   */
  private async callApi(num: number): Promise<{ results: string[] }> {
    return (await fetch(
      'http://' + location.host + '/api/v1/fizz-buzz?start=' + num.toString() + '&end=' + num.toString() +
        '&rules=' + JSON.stringify(this.rules)
    )).json();
  }
}
window.customElements.define('fizz-buzz', FizzBuzz);
