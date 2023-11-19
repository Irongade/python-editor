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

const questionOneInitText = `# write your code within the function below
# and click the run button when you are done

def add(x, y):
  
`;

const questionTwoInitText = `# write your code within the function below
# and click the run button when you are done

def arr_sum(array):
  
`;

const questionThreeInitText = `# write your code within the function below
# and click the run button when you are done

def key_press_duration(array):
  
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

      {
        title: "Example 3:",
        input: "Input: x = 55, y = 45",
        output: "Output: 100",
        explanation: "Explanation: 55 + 45 = 100",
      },
    ],
    constraints: [
      { text: "-10<sup>9</sup> <= x <= 10<sup>9</sup>", isCode: true },
      { text: "-10<sup>9</sup> <= y <= 10<sup>9</sup>", isCode: true },
      { text: "-10<sup>9</sup> <= ans <= 10<sup>9</sup>", isCode: true },
      { text: "Only one valid answer exists.", isCode: false },
    ],
    initText: questionOneInitText,
    tests: [
      {
        title: "case1",
        test: `\nassert add(10, 5) == 15`,
        input: "x = 10, y = 5",
        case: `\nadd(10, 5)`,
        expectedAnswer: "15",
        result: true,
      },
      {
        title: "case2",
        test: `\nassert add(20, 17) != 37`,
        input: "x = 20, y = 17",
        case: `\nadd(20, 17)`,
        expectedAnswer: "37",
        result: false,
      },
      {
        title: "case3",
        test: `\nassert add(55, 45) == 100`,
        input: "x = 55, y = 45",
        case: `\nadd(55, 45)`,
        expectedAnswer: "100",
        result: true,
      },
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
      {
        title: "Example 3:",
        input: "Input: x = [2, 8, 9, 1, 5, 2]",
        output: "Output: 27",
        explanation:
          "Explanation: Since length of array is greater than 5, then 2 + 8 + 9 + 1 + 5 + 2 = 31",
      },
    ],
    constraints: [
      { text: "2 <= x.length <= 10<sup>4</sup>", isCode: true },
      { text: "-10<sup>9</sup> <= x[i] <= 10<sup>9</sup>", isCode: true },
      { text: "-10<sup>9</sup> <= ans <= 10<sup>9</sup>", isCode: true },
      { text: "Only one valid answer exists.", isCode: false },
    ],
    initText: questionTwoInitText,
    tests: [
      {
        title: "case1",
        test: "\nassert arr_sum([1, 3, 5, 5, 8, 9]) == 31",
        result: true,
        input: "x = [1, 3, 5, 5, 8, 9]",
        case: `\narr_sum([1, 3, 5, 5, 8, 9])`,
        expectedAnswer: "31",
      },
      {
        title: "case2",
        test: "\narr_sum([0, 4, 3]) == 0",
        result: true,
        input: "x = [0, 4, 3]",
        case: `\narr_sum([0, 4, 3])`,
        expectedAnswer: "0",
      },
      {
        title: "case3",
        test: "\narr_sum([2, 8, 9, 1, 5, 2]) != 0",
        result: true,
        input: "x = [2, 8, 9, 1, 5, 2]",
        case: `\narr_sum([2, 8, 9, 1, 5, 2])`,
        expectedAnswer: "27",
      },
    ],
  },
  {
    id: 3,
    title: "KeyPress Estimation",
    subText1:
      "Write a function that takes in an array of times of when a user presses a key in microseconds and computes how long between each keypress there was.",
    subText2:
      "You can assume that the time always go up so item array[x] <= array[x+1].",
    subText3:
      "The function should return an array that contains the gaps/durations between each keypress time.",
    examples: [
      {
        title: "Example 1:",
        input: "Input: duration = [0, 10, 100, 200, 230]",
        output: "Output: [10,90, 100, 30]",
        explanation:
          "Explanation: Since duration between 10 - 0 = 10; 100 - 10 = 90; ...etc; return array is [10,90,100,30]",
      },
      {
        title: "Example 2:",
        input: "Input: duration = [0, 20, 40, 80, 160, 320]",
        output: "Output: [20, 20, 40, 80, 160]",
        explanation:
          "Explanation: Since duration between 20 - 0 = 10; 40 - 20 = 20; ...etc; return array is [20, 20, 40, 80, 160]",
      },
      {
        title: "Example 3:",
        input: "Input: duration = [0, 1, 2, 3, 4, 5]",
        output: "Output: [1, 1, 1, 1, 1]",
        explanation:
          "Explanation: Since duration between 1 - 0 = 1; 2 - 1 = 1; ...etc; return array is [1, 1, 1, 1, 1]",
      },
    ],
    constraints: [
      { text: "2 <= x.length <= 10<sup>4</sup>", isCode: true },
      { text: "-10<sup>9</sup> <= x[i] <= 10<sup>9</sup>", isCode: true },
      { text: "-10<sup>9</sup> <= ans <= 10<sup>9</sup>", isCode: true },
      { text: "Only one valid answer exists.", isCode: false },
    ],
    initText: questionThreeInitText,
    tests: [
      {
        title: "case1",
        test: "\nexpected_py = [10, 90, 100, 30]\narg_py = [0, 10, 100, 200, 230]\nassert all([a == b for a,b in zip(expected_py, key_press_duration(arg_py))])",
        result: true,
        input: "durations = [0, 10, 100, 200, 230]",
        case: `\nkey_press_duration([0, 10, 100, 200, 230])`,
        expectedAnswer: "[10, 90, 100, 30]",
      },
      {
        title: "case2",
        test: "\nexpected_py = [20, 20, 40, 80, 160]\narg_py = [0, 20, 40, 80, 160, 320]\nassert all([a == b for a,b in zip(expected_py, key_press_duration(arg_py))])",
        result: true,
        input: "durations = [0, 20, 40, 80, 160, 320]",
        case: `\nkey_press_duration([0, 20, 40, 80, 160, 320])`,
        expectedAnswer: "[20, 20, 40, 80, 160]",
      },
      {
        title: "case3",
        test: "\nexpected_py = [1, 1, 1, 1, 1]\narg_py = [0, 1, 2, 3, 4, 5]\nassert all([a == b for a,b in zip(expected_py, key_press_duration(arg_py))])",
        result: true,
        input: "durations = [0, 1, 2, 3, 4, 5]",
        case: `\nkey_press_duration([0, 1, 2, 3, 4, 5])`,
        expectedAnswer: "[1, 1, 1, 1, 1]",
      },
    ],
  },
];
