# Cash Register

## The Problem
Creative Cash Draw Solutions is a client who wants to provide something different for the cashiers who use their system. The function of the application is to tell the cashier how much change is owed, and what denominations should be used. In most cases the app should return the minimum amount of physical change, but the client would like to add a twist. If the "owed" amount is divisible by 3, the app should randomly generate the change denominations (but the math still needs to be right :))

Please write a program which accomplishes the clients goals. The program should:

1. Accept a flat file as input
	1. Each line will contain the amount owed and the amount paid separated by a comma (for example: 2.13,3.00)
	2. Expect that there will be multiple lines
2. Output the change the cashier should return to the customer
	1. The return string should look like: 1 dollar,2 quarters,1 nickel, etc ...
	2. Each new line in the input file should be a new line in the output file

## Sample Input
2.12,3.00

1.97,2.00

3.33,5.00

## Sample Output
3 quarters,1 dime,3 pennies

3 pennies

1 dollar,1 quarter,6 nickels,12 pennies

*Remember the last one is random

## The Fine Print
Please use whatever technology and techniques you feel are applicable to solve the problem. We suggest that you approach this exercise as if this code was part of a larger system. The end result should be representative of your abilities and style.

Please fork this repository. When you have completed your solution, please issue a pull request to notify us that you are ready.

Have fun.

## Things To Consider
Here are a couple of thoughts about the domain that could influence your response:

* What might happen if the client needs to change the random divisor?
* What might happen if the client needs to add another special case (like the random twist)?
* What might happen if sales closes a new client in France?

# My Solution

## Implementation Assumption

The prompt states that the "owed" amount determines whether randomized change should be used.

The sample `3.33,5.00` confirms that this refers to the amount owed (`333` cents), not the amount of change (`167` cents), because:

```
333 % 3 === 0
167 % 3 !== 0
```
## Run Solution
```
npm install	# Install Dependencies
npm run dev	# Run server on localhost:3000
npm test		# Run all tests
```

## Tech Stack
**Web**
- Next.js
- TypeScript
- daisyUI

**Testing**
- Jest

**CLI Tool**
- Go

## Web App Features
The project includes:

- A Next.js + daisyUI web interface
- Manual transaction entry
- .txt / .csv file upload
- Configurable currencies and denominations
- A strategy-based calculation system for client-specific change rules
- Jest tests for calculation logic and API behavior
- A lightweight Go CLI implementation

## Folder Structure
```
app/
├── api/
│   └── calculate/
│       ├── route.ts              # POST /api/calculate request handler
│       └── route.test.ts         # API route tests
│
├── components/                   # Reusable UI components
│
├── lib/
│   ├── calculateChange.ts        # Core transaction parsing + change orchestration
│   ├── currencies.ts             # Currency and denomination definitions
│   ├── types.ts                  # Shared TypeScript types
│   │
│   └── strategies/               # Change calculation strategies
│       ├── index.ts              # Strategy registry / priority order
│       ├── minimumStrategy.ts    # Greedy minimum-denomination strategy
│       ├── randomDivisibleStrategy.ts
│       │                         # Random strategy for owed amounts divisible by 3
│       └── types.ts              # Strategy-specific interfaces/types
│
├── page.tsx                      # Main CashRegister interface
│
└── advanced/
    └── page.tsx                  # Optional advanced features / currency controls

tests/
└── cash-register.test.ts         # Core calculation unit tests

cli/
├── go.mod                        # Go module definition
└── main.go                       # Lightweight Go CLI implementation
```

# Response to "Things to Consider"
## 1. What if the client needs to change the random divisor?

The random-change divisor is isolated from the core calculation flow, so the rule can be updated without changing the minimum-change algorithm or API behavior.

For example, changing the divisor from 3 to 5 only requires updating the configuration used by the randomized strategy.

## 2. What if the client needs to add another special case?

The calculation logic uses a strategy-based design. Each strategy defines:

- when it should apply
- how the change breakdown should be calculated

Strategies are evaluated in priority order, with the minimum-denomination strategy acting as the fallback.

This allows new rules to be added without modifying the core transaction calculation flow.

Potential future strategies could include:

- Prefer coins
- Avoid pennies
- Promotional denomination rules
- Currency-specific behavior
- Alternative randomized behavior

## 3. What if sales closes a new client in France?
#### Currency Support

Currencies are modeled independently from the calculation logic.

Each currency defines its own denominations and values in the smallest currency unit.

This allows the same calculator and strategy system to support currencies other than USD.

## Bonus - Go CLI

A small Go implementation is included in /cli.

From the CLI directory:

`cd cli`

Run a transaction directly:

`go run . "2.12,3.00"`

Example output:

`3 quarters, 1 dime, 3 pennies`

Build the CLI:

`go build -o cashregister`

On Windows:

`.\cashregister.exe "2.12,3.00"`