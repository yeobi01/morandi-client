'use client';

import { axiosInstance } from '@/api/axiosSetting';
import Editor, { loader } from '@monaco-editor/react';
import { useState, useEffect } from 'react';
import Link from 'next/link';

import Lottie from 'react-lottie-player';
import Loading from '@/assets/lottiefiles/loading.json';
import Gap from '@/utils/gap';

const languages = [
  { value: 'cpp', label: 'C++' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
];

interface ProblemInfoType {
  problem_title: string;
  problem_description: string;
  problem_input: string;
  problem_output: string;
  input_sample: Array<string>;
  output_sample: Array<string>;
}

interface TestCodeDto {
  problemNumber: number;
  pythonCode: string;
  javaCode: string;
  cppCode: string;
}

export default function CustomEditor({
  testCodeDtos,
  problemBojId,
  problemInfo,
  problemId,
}: {
  testCodeDtos: TestCodeDto[] | undefined;
  problemBojId: number | undefined;
  problemInfo: ProblemInfoType[];
  problemId: number;
}) {
  const [userInput, setUserInput] = useState('');
  const [userFontSize, setUserFontSize] = useState(16); // 추후에 폰트 사이즈 조절 기능 추가
  const [isLoading, setIsLoading] = useState(false);
  // const [userCode, setUserCode] = useState(defaultValues.cpp);
  const [userLang, setUserLang] = useState('cpp');
  const [axiosLang, setAxiosLang] = useState('Cpp'); // axios 요청 시 사용할 언어
  const [userOutput, setUserOutput] = useState<string>('');
  const [flag, setFlag] = useState(false);
  // const [defaultValue, setDefualtValue] = useState(defaultValues.cpp);
  const [executeTime, setExecuteTime] = useState(0);

  const firstCodeTest: string[][] = [];
  testCodeDtos?.map((item) => {
    firstCodeTest.push([item.cppCode, item.pythonCode, item.javaCode]);
  });

  const [userCodeTest, setUserCodeTest] = useState<string[][]>(firstCodeTest);

  const options = {
    fontSize: userFontSize,
  };

  /* 예제 하나 컴파일하는 함수 */
  const compile = () => {
    setFlag(true);
    setIsLoading(true);
    const userCode =
      userLang === 'cpp'
        ? userCodeTest[problemId - 1][0]
        : userLang === 'python'
        ? userCodeTest[problemId - 1][1]
        : userCodeTest[problemId - 1][2];
    if (userCode === '') {
      return;
    }
    console.log(userCode);
    axiosInstance
      .post(
        '/tests/output',
        {
          language: axiosLang,
          code: userCode,
          input: userInput,
        },
        { withCredentials: true },
      )
      .then((res) => {
        console.log('1234');
        console.log(res.data);
        setUserOutput(
          `<div style="display: flex; flex-direction: row; margin: 0.3rem 0 0 1rem;">
              <div style="color: #686868;">컴파일 결과 >  </div>
              <div style="color: ${
                res.data.result === '성공' ? 'green' : 'red'
              }">${res.data.result}</div>
            </div>` +
            `<div style="display: flex; flex-direction: row; margin: 0 0 0 1rem;">
              <div style="color: #686868;">실행 결과  >  </div>
              <div>${res.data.output}</div>
            </div>` +
            `<div style="display: flex; flex-direction: row; margin: 0 0 1rem 1rem;">
              <div style="color: #686868;">실행 시간  >  </div>
              <div>${res.data.executeTime}s</div>
            </div>`,
        );
        setExecuteTime(res.data.runTime);
        setIsLoading(false);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  /* 한 번에 여러 예제에 대한 테스트 결과를 받아오는 API */
  const sampleCompile = async () => {
    const userCode =
      userLang === 'cpp'
        ? userCodeTest[problemId - 1][0]
        : userLang === 'python'
        ? userCodeTest[problemId - 1][1]
        : userCodeTest[problemId - 1][2];
    if (userCode === '') {
      return;
    }
    console.log(userCode);
    const output = await axiosInstance.post(
      '/tests/tc-output',
      {
        language: axiosLang,
        code: userCode,
        input: problemInfo[problemId - 1].input_sample,
        output: problemInfo[problemId - 1].output_sample,
      },
      { withCredentials: true },
    );
    console.log(output);
    return output.data;
  };

  /* 한 번에 여러 예제에 대한 테스트 결과를 Output 박스에 작성하는 함수 */
  const samplesCompile = async () => {
    setFlag(true);
    setIsLoading(true);
    let samplesCompileOutput = '';

    const temp = await sampleCompile();
    console.log(temp);
    for (let idx = 0; idx < temp.length; idx++) {
      samplesCompileOutput = samplesCompileOutput.concat(
        `<div style="font-size: 1rem; color: #12AC79; font-weight: 700;">예제 입력 ${
          idx + 1
        }</div>` +
          `<div style="display: flex; flex-direction: row; margin: 0.3rem 0 0 2rem;">
            <div style="color: #686868;">실행 결과  >  </div>
            <div>${temp[idx].output}</div>
          </div>` +
          `<div style="display: flex; flex-direction: row; margin: 0 0 0 2rem;">
            <div style="color: #686868;">실행 시간  >  </div>
            <div>${temp[idx].executeTime}s</div>
          </div>` +
          `<div style="display: flex; flex-direction: row; margin: 0 0 1rem 2rem;">
            <div style="color: #686868;">정답 여부  >  </div>
            <div style="color: ${
              temp[idx].result === '성공' ? 'green' : 'red'
            }">${temp[idx].result}</div>
          </div>`,
      );
    }
    setUserOutput(samplesCompileOutput);
    setIsLoading(false);
  };

  const clearOutput = () => {
    setUserOutput('');
  };

  /* 커스텀 에디터 적용하기 */
  useEffect(() => {
    loader.init().then((monaco) => {
      monaco.editor.defineTheme('myTheme', theme);
    });
  }, []);

  return (
    <>
      <div className="flex flex-col w-[53vw]">
        <select
          className="w-[5rem] ml-[0.5rem] mb-[0.5rem] bg-gray-900"
          onChange={(e) => {
            setUserLang(e.target.value);
            if (e.target.value === 'cpp') {
              setAxiosLang('Cpp');
              // setDefualtValue(defaultValues.cpp);
              // setUserCode(defaultValues.cpp);
            }
            if (e.target.value === 'python') {
              setAxiosLang('Python');
              // setDefualtValue(defaultValues.python);
              // setUserCode(defaultValues.python);
            }
            if (e.target.value === 'java') {
              setAxiosLang('Java');
              // setDefualtValue(defaultValues.java);
              // setUserCode(defaultValues.java);
            }
          }}
        >
          {languages.map((lang) => (
            <option value={lang.value} key={lang.value}>
              {lang.label}
            </option>
          ))}
        </select>
        <div className="flex flex-col justify-center h-[52vh] w-[100%] bg-[#2E3642] rounded-xl">
          <Editor
            options={options}
            height="50vh"
            width="100%"
            theme="myTheme"
            language={userLang}
            // defaultValue={defaultValue}
            value={
              userLang === 'cpp'
                ? userCodeTest[problemId - 1][0]
                : userLang === 'python'
                ? userCodeTest[problemId - 1][1]
                : userCodeTest[problemId - 1][2]
            }
            onChange={(value) => {
              if (typeof value === 'string') {
                const index = ['cpp', 'python', 'java'].indexOf(userLang);
                if (index !== -1) {
                  setUserCodeTest((prev) => {
                    return prev.map((item, idx) => {
                      if (idx === problemId - 1) {
                        return item.map((item2, idx2) => {
                          if (idx2 === index) {
                            return value;
                          } else {
                            return item2;
                          }
                        });
                      } else {
                        return item;
                      }
                    });
                  });
                }
              }
            }}
          />
        </div>

        <div className="flex flex-row ml-[0.5rem] mt-[1rem] mb-[0.5rem]">
          <button
            onClick={() => {
              setFlag(false);
            }}
            style={{
              color: flag ? '#FFFFFF' : '#12AC79',
            }}
          >
            입력하기
          </button>
          <Gap wSize="0.5rem" />
          <button
            onClick={() => {
              setFlag(true);
            }}
            style={{
              color: flag ? '#12AC79' : '#FFFFFF',
            }}
          >
            출력결과
          </button>
        </div>
        <div className="h-[24vh] w-full mb-[1rem] bg-[#2E3642] p-[1rem] rounded-xl overflow-y-auto overflow-x-hidden">
          {flag ? (
            isLoading ? (
              <div className="flex justify-center items-center w-[100%] h-[100%] ">
                <Lottie
                  loop
                  animationData={Loading}
                  play
                  className="w-[15rem]"
                />
              </div>
            ) : (
              <div
                className="whitespace-pre-wrap w-full break-all"
                dangerouslySetInnerHTML={{ __html: userOutput }}
              ></div>
            )
          ) : (
            <textarea
              id="code-inp"
              onChange={(e) => setUserInput(e.target.value)}
              className="bg-[#2E3642] w-full h-[97%] text-white focus:outline-0"
            ></textarea>
          )}
        </div>
        <div className="flex flex-row justify-end items-center">
          <button
            onClick={compile}
            className="h-[2rem] w-[6rem] border-2 border-white rounded-xl"
          >
            실행하기
          </button>
          <div className="w-[1rem]" />
          <button
            onClick={samplesCompile}
            className="h-[2rem] w-[6rem] bg-[#F04452] rounded-xl"
          >
            예제결과
          </button>
          <div className="w-[1rem]" />
          <Link
            href={`https://www.acmicpc.net/submit/${problemBojId}`}
            target="_blank"
          >
            <button className="h-[2rem] w-[6rem] bg-[#12AC79] rounded-xl">
              제출하기
            </button>
          </Link>
        </div>
      </div>
    </>
  );
}

const defaultValues = {
  cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
  ios_base::sync_with_stdio(false);
  cin.tie(NULL);
  cout.tie(NULL);

  cout << "Hello World!";
  
  return 0;
}
`,
  python: `print("Hello World!")
`,
  java: `import java.util.*;
import java.lang.*;
import java.io.*;

class Main
{
	public static void main (String[] args)
	{
		System.out.println("Hello World!");
	}
}`,
};

const theme: any = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    {
      background: '272822',
      token: '',
    },
    {
      foreground: '75715e',
      token: 'comment',
    },
    {
      foreground: 'e6db74',
      token: 'string',
    },
    {
      foreground: 'ae81ff',
      token: 'constant.numeric',
    },
    {
      foreground: 'ae81ff',
      token: 'constant.language',
    },
    {
      foreground: 'ae81ff',
      token: 'constant.character',
    },
    {
      foreground: 'ae81ff',
      token: 'constant.other',
    },
    {
      foreground: 'f92672',
      token: 'keyword',
    },
    {
      foreground: 'f92672',
      token: 'storage',
    },
    {
      foreground: '66d9ef',
      fontStyle: 'italic',
      token: 'storage.type',
    },
    {
      foreground: 'a6e22e',
      fontStyle: 'underline',
      token: 'entity.name.class',
    },
    {
      foreground: 'a6e22e',
      fontStyle: 'italic underline',
      token: 'entity.other.inherited-class',
    },
    {
      foreground: 'a6e22e',
      token: 'entity.name.function',
    },
    {
      foreground: 'fd971f',
      fontStyle: 'italic',
      token: 'variable.parameter',
    },
    {
      foreground: 'f92672',
      token: 'entity.name.tag',
    },
    {
      foreground: 'a6e22e',
      token: 'entity.other.attribute-name',
    },
    {
      foreground: '66d9ef',
      token: 'support.function',
    },
    {
      foreground: '66d9ef',
      token: 'support.constant',
    },
    {
      foreground: '66d9ef',
      fontStyle: 'italic',
      token: 'support.type',
    },
    {
      foreground: '66d9ef',
      fontStyle: 'italic',
      token: 'support.class',
    },
    {
      foreground: 'f8f8f0',
      background: 'f92672',
      token: 'invalid',
    },
    {
      foreground: 'f8f8f0',
      background: 'ae81ff',
      token: 'invalid.deprecated',
    },
    {
      foreground: 'cfcfc2',
      token: 'meta.structure.dictionary.json string.quoted.double.json',
    },
    {
      foreground: '75715e',
      token: 'meta.diff',
    },
    {
      foreground: '75715e',
      token: 'meta.diff.header',
    },
    {
      foreground: 'f92672',
      token: 'markup.deleted',
    },
    {
      foreground: 'a6e22e',
      token: 'markup.inserted',
    },
    {
      foreground: 'e6db74',
      token: 'markup.changed',
    },
    {
      foreground: 'ae81ffa0',
      token: 'constant.numeric.line-number.find-in-files - match',
    },
    {
      foreground: 'e6db74',
      token: 'entity.name.filename.find-in-files',
    },
  ],
  colors: {
    'editor.foreground': '#F8F8F2',
    'editor.background': '#2E3642',
    'editor.selectionBackground': '#49483E',
    'editor.lineHighlightBackground': '#3E3D32',
    'editorCursor.foreground': '#F8F8F0',
    'editorWhitespace.foreground': '#3B3A32',
    'editorIndentGuide.activeBackground': '#9D550FB0',
    'editor.selectionHighlightBorder': '#222218',
    'minimap.background': '#2E3642',
  },
};
