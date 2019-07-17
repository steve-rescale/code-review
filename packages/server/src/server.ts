import express from 'express';
import morgan from 'morgan';

const app = express();
const port = 3000;

app.use(morgan('dev'));

type FizzBuzzFactorLabel = [number, string];

/**
 * Give a start-end range and a list of [integer, label] rules (all optional), return the range coded with those rules
 */
app.get('/api/v1/fizz-buzz', (req, res) => {
  const badRequest = (error: string) =>
    res.status(400).json({ error });

  const bounds = {
    start: parseInt(req.query.start || '1', 10),
    end: parseInt(req.query.end || '100', 10)
  };
  if (bounds.start > bounds.end) {
    const tmp = bounds.start;
    bounds.start = bounds.end;
    bounds.end = tmp;
  }
  if (bounds.end - bounds.start > 1000) {
    return res.status(400).json({ error: 'list length > 1000' });
  }

  const strategy: FizzBuzzFactorLabel[] = [];
  if (req.query.rules) {
    try {
      const rules = JSON.parse(req.query.rules);
      if (!Array.isArray(rules)) {
        throw new Error('non-array rule set');
      }
      rules.forEach((rule: unknown, idx: number) => {
        if (!Array.isArray(rule) || rule.length !== 2 || typeof rule[0] !== 'number' || typeof rule[1] !== 'string' || parseInt(rule[0], 10) !== rule[0]) {
          throw new Error(`invalid term in rule #${ idx }`);
        }
        strategy.push(rule as FizzBuzzFactorLabel);
      });
    }
    catch (ex) {
      console.error(ex);
      return badRequest('invalid rule set');
    }
  }
  else {
    strategy.push([3, 'Fizz']);
    strategy.push([5, 'Buzz']);
  }


  setTimeout(() =>
    res.json({
      results: Array.from({ length: bounds.end - bounds.start + 1 }).map((_, idx) =>
        strategy.reduce(
          (acc: string | number, [num, lbl]) =>
            ((idx + bounds.start) % num === 0)
              ? `${ typeof acc === 'number' ? '' : acc }${ lbl }`
              : acc,
          idx + bounds.start
        )
      )
    }),
    Math.random() * 50
  );
});

app.use(express.static('../front-end/lib'));
app.listen(port, () => console.log(`localhost:${ port }`));
