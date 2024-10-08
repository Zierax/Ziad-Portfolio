import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Terminal } from 'lucide-react';
import { Link } from 'react-router-dom';

const SecretPage: React.FC = () => {
  const [message, setMessage] = useState('');
  const [showTerminal, setShowTerminal] = useState(false);
  const [terminalInput, setTerminalInput] = useState('');
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [currentPath, setCurrentPath] = useState('/root');
  const [files, setFiles] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const fullMessage = "You want root? So get it...";

  const fakeFileSystem: Record<string, string[] | string> = {
    '/root': ['flag.txt', 'passwords.txt', 'config.sh', 'hidden-folder'],
    '/root/flag.txt': 'WHAT ARE YOU DOING HERE?? Go and find something useful to do.',
    '/root/passwords.txt': 'root:1234\nuser:password',
    '/root/config.sh': 'echo "config loaded"',
    '/root/hidden-folder': ['secret.txt'],
    '/root/hidden-folder/secret.txt': 'This is a hidden file. Shh!',
    '/home/user': ['notes.txt'],
    '/home/user/notes.txt': 'Remember to check the server logs.',
  };

  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      if (index < fullMessage.length) {
        setMessage((prev) => prev + fullMessage[index]);
        index++;
      } else {
        clearInterval(timer);
        setTimeout(() => setShowTerminal(true), 1000);
      }
    }, 100);
    return () => clearInterval(timer);
  }, []);

  const handleTerminalInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const command = terminalInput.trim();
      let response: string = '';
      if (command === 'exit') {
        response = 'Session closed.';
        setShowTerminal(false);
      } else {
        response = executeCommand(command);
      }
      setTerminalOutput([...terminalOutput, `$ ${terminalInput}`, response]);

      setCommandHistory([terminalInput, ...commandHistory]);
      setHistoryIndex(-1);

      setTerminalInput('');
    } else if (e.key === 'ArrowUp') {
      if (historyIndex < commandHistory.length - 1) {
        setHistoryIndex((prev) => prev + 1);
        setTerminalInput(commandHistory[historyIndex + 1]);
      }
    } else if (e.key === 'ArrowDown') {
      if (historyIndex > 0) {
        setHistoryIndex((prev) => prev - 1);
        setTerminalInput(commandHistory[historyIndex - 1]);
      }
    }
  };

  const executeCommand = (command: string): string => {
    const args = command.split(' ');
    let response: string = '';

    switch (args[0]) {
      case 'ls':
        response = listDirectory(currentPath);
        break;
      case 'cd':
        if (args[1] && fakeFileSystem[`${currentPath}/${args[1]}`]) {
          setCurrentPath(`${currentPath}/${args[1]}`);
          response = `Changed directory to ${currentPath}/${args[1]}`;
        } else {
          response = `No such directory: ${args[1]}`;
        }
        break;
      case 'cat':
        if (fakeFileSystem[`${currentPath}/${args[1]}`]) {
          response = fakeFileSystem[`${currentPath}/${args[1]}`] as string;
        } else {
          response = `No such file: ${args[1]}`;
        }
        break;
      case 'echo':
        response = args.slice(1).join(' ');
        break;
      case 'hack':
        simulateHacking();
        response = 'Hacking in progress...';
        break;
      case 'sudo su':
        response = 'Password: ';
        break;
      case 'exit':
        response = 'Session closed.';
        setShowTerminal(false);
        break;
      default:
        response = `Command not found: ${command}`;
        break;
    }
    return response;
  };

  const listDirectory = (path: string) => {
    const content = fakeFileSystem[path];
    if (Array.isArray(content)) {
      setFiles(content);
      return content.join(' ');
    } else {
      return `No such directory: ${path}`;
    }
  };

  const simulateHacking = () => {
    const hackingMessages = [
      'Connecting to server...',
      'Bypassing firewall...',
      'Searching for vulnerabilities...',
      'Exploiting vulnerabilities...',
      'Access granted. Root user logged in.',
    ];

    hackingMessages.forEach((msg, index) => {
      setTimeout(() => {
        setTerminalOutput((prev) => [...prev, msg]);
      }, 2000 * index);
    });
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      <div className="text-neon-green font-mono text-2xl mb-8 whitespace-pre-line">
        {message}
      </div>
      {showTerminal && (
        <div className="bg-gray-900 p-4 rounded-lg w-full max-w-2xl mb-8 shadow-lg">
          <div className="flex items-center mb-2">
            <Terminal className="text-neon-green mr-2" />
            <span className="text-neon-green font-mono">Terminal</span>
          </div>

          <div className="text-neon-green font-mono h-64 overflow-y-auto mb-2 bg-gray-800 rounded-lg p-2 border border-gray-600">
            {terminalOutput.map((line, index) => (
              <p key={index}>{line}</p>
            ))}
          </div>

          <div className="flex items-center bg-gray-700 rounded-lg p-2">
            <span className="text-neon-green mr-2">root@localhost:~$</span>
            <input
              ref={inputRef}
              type="text"
              value={terminalInput}
              onChange={(e) => setTerminalInput(e.target.value)}
              onKeyDown={handleTerminalInput}
              className="bg-transparent text-neon-green font-mono outline-none flex-grow"
              autoFocus
            />
          </div>
        </div>
      )}
      <Link to="/" className="text-neon-blue hover:text-neon-purple transition-colors flex items-center mt-4">
        <ArrowLeft className="mr-2" />
        Back to Home
      </Link>
    </div>
  );
};

export default SecretPage;
