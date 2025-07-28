'use client';

import { useState, useEffect } from 'react';
import { Memo } from '@/lib/db/schema';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface MemoFormProps {
  memo?: Memo | null;
  onSave: (memo: Partial<Memo>) => void;
  onCancel: () => void;
}

export function MemoForm({ memo, onSave, onCancel }: MemoFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    tags: [] as string[],
  });
  const [loading, setLoading] = useState(false);
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (memo) {
      setFormData({
        title: memo.title,
        content: memo.content,
        category: memo.category || '',
        tags: memo.tags || [],
      });
    }
  }, [memo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.content.trim()) {
      alert('제목과 내용을 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      onSave(formData);
    } catch (error) {
      alert('메모 저장에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()],
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">
        {memo ? '메모 수정' : '새 메모 작성'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            제목 *
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="메모 제목을 입력하세요"
            required
          />
        </div>

        <div>
          <label
            htmlFor="content"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            내용 *
          </label>
          <textarea
            id="content"
            value={formData.content}
            onChange={(e) =>
              setFormData({ ...formData, content: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="메모 내용을 입력하세요"
            rows={6}
            required
          />
        </div>

        <div>
          <label
            htmlFor="category"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            카테고리
          </label>
          <input
            type="text"
            id="category"
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="카테고리를 입력하세요"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            태그
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="태그를 입력하고 Enter를 누르세요"
            />
            <Button
              type="button"
              onClick={handleAddTag}
              variant="outline"
              size="sm"
            >
              추가
            </Button>
          </div>
          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm flex items-center gap-1"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-4">
          <Button type="submit" loading={loading} disabled={loading}>
            {memo ? '수정' : '저장'}
          </Button>
          <Button
            type="button"
            onClick={onCancel}
            variant="outline"
            disabled={loading}
          >
            취소
          </Button>
        </div>
      </form>
    </Card>
  );
}
