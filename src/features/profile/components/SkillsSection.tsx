import React, { useState } from 'react';
import PrimaryButton from '../../../components/UI/buttons/PrimaryButton';
import SecondaryButton from '../../../components/UI/buttons/SecondaryButton';

const SkillsSection: React.FC = () => {
  const [skills, setSkills] = useState<string[]>(['Carpentry', 'Electrical', 'Gardening']);
  const [newSkill, setNewSkill] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const commonSkills = [
    'Carpentry', 'Electrical', 'Plumbing', 'Gardening', 'Painting',
    'First Aid', 'Teaching', 'Cooking', 'Cleaning', 'Organization',
    'Communication', 'Leadership', 'Technical Support', 'Event Planning'
  ];

  const addSkill = (skill: string) => {
    if (skill && !skills.includes(skill)) {
      setSkills(prev => [...prev, skill]);
    }
    setNewSkill('');
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(prev => prev.filter(skill => skill !== skillToRemove));
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Skills & Expertise</h2>
          <p className="text-gray-600 mt-1">
            Showcase your skills to help match you with relevant community issues
          </p>
        </div>
        
        <SecondaryButton
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? 'Done' : 'Edit Skills'}
        </SecondaryButton>
      </div>

      {isEditing ? (
        <div className="space-y-4">
          {/* Add Skill Input */}
          <div className="flex space-x-3">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="Add a skill..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <PrimaryButton
              onClick={() => addSkill(newSkill)}
              disabled={!newSkill.trim()}
            >
              Add
            </PrimaryButton>
          </div>

          {/* Common Skills Suggestions */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Common Skills</h4>
            <div className="flex flex-wrap gap-2">
              {commonSkills.map(skill => (
                <button
                  key={skill}
                  onClick={() => addSkill(skill)}
                  disabled={skills.includes(skill)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    skills.includes(skill)
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  }`}
                >
                  + {skill}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {/* Skills Display */}
      <div className="flex flex-wrap gap-2">
        {skills.map(skill => (
          <div
            key={skill}
            className="flex items-center space-x-2 px-3 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
          >
            <span>{skill}</span>
            {isEditing && (
              <button
                onClick={() => removeSkill(skill)}
                className="w-4 h-4 rounded-full bg-blue-200 hover:bg-blue-300 text-blue-800 flex items-center justify-center text-xs"
              >
                ×
              </button>
            )}
          </div>
        ))}

        {skills.length === 0 && (
          <p className="text-gray-500 text-center py-4">
            No skills added yet. {!isEditing && 'Click "Edit Skills" to add your skills.'}
          </p>
        )}
      </div>

      {/* Skill Levels (Optional) */}
      {skills.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Skill Proficiency</h4>
          <div className="space-y-3">
            {skills.map(skill => (
              <div key={skill} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{skill}</span>
                <select 
                  className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  defaultValue="intermediate"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </select>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillsSection;