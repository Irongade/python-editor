export const python_code_wrapper = `
from io import StringIO
import sys
import traceback
namespace = {}  # use separate namespace to hide run_code, modules, etc.
def run_code(code):
  """run specified code and return stdout and stderr"""
  out = StringIO()
  oldout = sys.stdout
  olderr = sys.stderr
  sys.stdout = sys.stderr = out
  try:
      # change next line to exec(code, {}) if you want to clear vars each time
      exec(code, namespace)
  except:
      traceback.print_exc()

  sys.stdout = oldout
  sys.stderr = olderr
  return out.getvalue()
`;

export const find_imports_wrapper = (code) => `
from pyodide.code import find_imports
find_imports(${code})
`;

export const python_code_header = `
assert add(4,4) == 8
assert add(2,5) == 7
`;

export const python_code_test = `
assert add(4,4) == 8
assert add(2,5) == 7
`;

export const py_error_reformater = `
import sys
def reformat_exception():
    from traceback import format_exception
    # Format a modified exception here
    # this just prints it normally but you could for instance filter some frames
    return "".join(
        format_exception(sys.last_type, sys.last_value, sys.last_traceback)
    )
`;

export const questionData = [
  {
    id: 1,
    title: "Addition",
    subText1:
      "Write a function that accepts two integers and returns the addition",
    subText2: "You may assume that each input will be a number.",
    subText3: "",
    examples: [
      {
        title: "Example 1:",
        input: "Input: x = 10, y = 5",
        output: "Output: 15",
        explanation: "Explanation: 10 + 5 = 15",
      },
      {
        title: "Example 2:",
        input: "Input: x = 20, y = 17",
        output: "Output: 37",
        explanation: "Explanation: 20 + 17 = 37",
      },
    ],
    constraints: [
      { text: "-10<sup>9</sup> <= x <= 10<sup>9</sup>", isCode: true },
      { text: "-10<sup>9</sup> <= y <= 10<sup>9</sup>", isCode: true },
      { text: "-10<sup>9</sup> <= ans <= 10<sup>9</sup>", isCode: true },
      { text: "Only one valid answer exists.", isCode: false },
    ],
  },
  {
    id: 2,
    title: "Array Summation",
    subText1:
      "Write a function that adds numbers from an array if they are greater than 5",
    subText2: "You may assume that each entry in the array will be a number.",
    subText3: "The array should return either 0 or the summed value.",
    examples: [
      {
        title: "Example 1:",
        input: "Input: x = [1, 3, 5, 5, 8, 9]",
        output: "Output: 31",
        explanation:
          "Explanation: Since length of array is greater than 5, then 1 + 3 + 5 + 5 + 8 + 9 = 31",
      },
      {
        title: "Example 2:",
        input: "Input: x = [0, 4, 3]",
        output: "Output: 0",
        explanation:
          "Explanation: Since length of array is less than 5, output is 0",
      },
    ],
    constraints: [
      { text: "2 <= x.length <= 10<sup>4</sup>", isCode: true },
      { text: "-10<sup>9</sup> <= x[i] <= 10<sup>9</sup>", isCode: true },
      { text: "-10<sup>9</sup> <= ans <= 10<sup>9</sup>", isCode: true },
      { text: "Only one valid answer exists.", isCode: false },
    ],
  },
];
