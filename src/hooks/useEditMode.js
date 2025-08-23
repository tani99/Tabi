import { useState } from 'react';

const useEditMode = (initialValue, onSave) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialValue);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleEdit = () => {
    setIsEditing(true);
    setError(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setValue(initialValue);
    setError(null);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);
      await onSave(value);
      setIsEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    isEditing,
    value,
    setValue,
    loading,
    error,
    handleEdit,
    handleCancel,
    handleSave
  };
};

export default useEditMode;
