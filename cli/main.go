package main

import (
	"fmt"
	"os"
	"strconv"
	"strings"
)

type Denomination struct {
	Name  string
	Value int
}

var denominations = []Denomination{
	{Name: "dollar", Value: 100},
	{Name: "quarter", Value: 25},
	{Name: "dime", Value: 10},
	{Name: "nickel", Value: 5},
	{Name: "penny", Value: 1},
}

func parseCents(value string) (int, error) {
	amount, err := strconv.ParseFloat(value, 64)
	if err != nil {
		return 0, err
	}

	return int(amount*100 + 0.5), nil
}

func calculateChange(input string) (string, error) {
	parts := strings.Split(input, ",")

	if len(parts) != 2 {
		return "", fmt.Errorf("expected input like \"2.12,3.00\"")
	}

	owed, err := parseCents(strings.TrimSpace(parts[0]))
	if err != nil {
		return "", fmt.Errorf("invalid amount owed")
	}

	paid, err := parseCents(strings.TrimSpace(parts[1]))
	if err != nil {
		return "", fmt.Errorf("invalid amount paid")
	}

	change := paid - owed

	if change < 0 {
		return "", fmt.Errorf("amount paid is less than amount owed")
	}

	if change == 0 {
		return "No change due", nil
	}

	remaining := change
	results := []string{}

	for _, denom := range denominations {
		count := remaining / denom.Value

		if count > 0 {
			name := denom.Name

			if count > 1 {
				switch denom.Name {
				case "penny":
					name = "pennies"
				default:
					name += "s"
				}
			}

			results = append(
				results,
				fmt.Sprintf("%d %s", count, name),
			)

			remaining %= denom.Value
		}
	}

	return strings.Join(results, ", "), nil
}

func main() {
	if len(os.Args) < 2 {
		fmt.Println(`Usage: cashregister "2.12,3.00"`)
		os.Exit(1)
	}

	result, err := calculateChange(os.Args[1])

	if err != nil {
		fmt.Println("Error:", err)
		os.Exit(1)
	}

	fmt.Println(result)
}
