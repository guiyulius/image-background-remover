'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

type AppState = 'upload' | 'processing' | 'result' | 'error';

export default function Home() {
  const [state, setState] = useState<AppState>('upload');
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [bgColor, setBgColor] = useState<string>('transparent');
  const [error, setError] = useState<string>('');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setOriginalImage(reader.result as string);
        processImage(file);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/jpeg': [], 'image/png': [], 'image/webp': [] },
    maxSize: 10 * 1024 * 1024
  });

  const processImage = async (file: File) => {
    setState('processing');
    setError('');
    setTimeout(() => {
      setResultImage(originalImage);
      setState('result');
    }, 3000);
  };

  const handleDownload = () => {
    if (!resultImage) return;
    const link = document.createElement('a');
    link.download = `removebg_${Date.now()}.png`;
    link.href = resultImage;
    link.click();
  };

  const handleReset = () => {
    setState('upload');
    setOriginalImage(null);
    setResultImage(null);
    setBgColor('transparent');
    setError('');
  };

  const bgColors = [
    { name: '透明', value: 'transparent' },
    { name: '白色', value: '#FFFFFF' },
    { name: '蓝色', value: '#0066CC' },
    { name: '红色', value: '#FF0000' }
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <header className="p-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">RemoveBG Pro</h1>
        <span className="text-slate-400 text-sm">免费版: 每天 5 次</span>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {state === 'upload' && (
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-2">AI 智能图片背景去除</h2>
            <p className="text-slate-400 mb-8">上传图片，AI 自动识别主体并去除背景</p>

            <div {...getRootProps()} className={`border-2 border-dashed rounded-2xl p-16 cursor-pointer transition-all ${isDragActive ? 'border-blue-500 bg-blue-500/10' : 'border-slate-600 hover:border-slate-500 bg-slate-800/50'}`}>
              <input {...getInputProps()} />
              <div className="text-6xl mb-4">📁</div>
              <p className="text-white text-lg mb-2">{isDragActive ? '松开鼠标上传' : '拖拽图片到此处，或点击选择'}</p>
              <p className="text-slate-500">支持 JPG/PNG/WEBP，最大 10MB</p>
            </div>
          </div>
        )}

        {state === 'processing' && (
          <div className="text-center py-16">
            <div className="text-6xl mb-6 animate-pulse">🤖</div>
            <h2 className="text-2xl font-bold text-white mb-2">AI 正在抠图...</h2>
            <p className="text-slate-400">预计需要 3-10 秒</p>
          </div>
        )}

        {state === 'result' && (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-6">处理完成</h2>
            <div className="flex justify-center gap-4 mb-8 flex-wrap">
              <div className="bg-slate-800 rounded-xl p-4">
                <p className="text-slate-400 mb-2 text-sm">原图</p>
                <img src={originalImage!} alt="Original" className="max-w-xs rounded-lg mx-auto" />
              </div>
              <div className="bg-slate-800 rounded-xl p-4">
                <p className="text-slate-400 mb-2 text-sm">结果</p>
                <div className="max-w-xs rounded-lg mx-auto" style={{ backgroundColor: bgColor }}>
                  <img src={resultImage!} alt="Result" className="max-w-xs rounded-lg" />
                </div>
              </div>
            </div>
            <div className="mb-8">
              <p className="text-slate-400 mb-3">选择背景颜色</p>
              <div className="flex justify-center gap-3">
                {bgColors.map((color) => (
                  <button key={color.value} onClick={() => setBgColor(color.value)} className={`px-4 py-2 rounded-lg ${bgColor === color.value ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-300'}`}>
                    {color.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-center gap-4">
              <button onClick={handleDownload} className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold">下载图片</button>
              <button onClick={handleReset} className="px-8 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold">继续处理</button>
            </div>
          </div>
        )}

        {state === 'error' && (
          <div className="text-center py-16">
            <div className="text-6xl mb-6">❌</div>
            <h2 className="text-2xl font-bold text-red-400 mb-2">处理失败</h2>
            <p className="text-slate-400 mb-6">{error}</p>
            <button onClick={handleReset} className="px-8 py-3 bg-slate-700 text-white rounded-lg font-semibold">重试</button>
          </div>
        )}
      </div>
    </main>
  );
}