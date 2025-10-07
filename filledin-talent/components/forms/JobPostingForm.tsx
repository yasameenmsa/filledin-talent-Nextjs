'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { 
  Briefcase, 
  MapPin, 
  DollarSign, 
  Clock, 
  Users, 
  FileText,
  Plus,
  X,
  Save,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';

const jobPostingSchema = z.object({
  title: z.string().min(1, 'Job title is required').max(100, 'Title too long'),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  requirements: z.array(z.string()).min(1, 'At least one requirement is needed'),
  responsibilities: z.array(z.string()).min(1, 'At least one responsibility is needed'),
  company: z.object({
    name: z.string().min(1, 'Company name is required'),
    description: z.string().optional(),
    website: z.string().url().optional().or(z.literal('')),
  }),
  location: z.object({
    city: z.string().min(1, 'City is required'),
    state: z.string().optional(),
    country: z.string().min(1, 'Country is required'),
    remote: z.boolean().default(false),
  }),
  jobType: z.enum(['full-time', 'part-time', 'contract', 'freelance', 'internship']),
  experienceLevel: z.enum(['entry', 'mid', 'senior', 'executive']),
  salary: z.object({
    min: z.number().min(0, 'Minimum salary must be positive'),
    max: z.number().min(0, 'Maximum salary must be positive'),
    currency: z.string().default('USD'),
    period: z.enum(['hourly', 'monthly', 'yearly']).default('yearly'),
  }).refine(data => data.max >= data.min, {
    message: 'Maximum salary must be greater than or equal to minimum salary',
    path: ['max'],
  }),
  benefits: z.array(z.string()).optional(),
  requiredSkills: z.array(z.string()).min(1, 'At least one skill is required'),
  preferredSkills: z.array(z.string()).optional(),
  applicationDeadline: z.string().optional(),
});

type JobPostingFormData = z.infer<typeof jobPostingSchema>;

interface JobPostingFormProps {
  lang: string;
  initialData?: Partial<JobPostingFormData>;
  isEditing?: boolean;
  jobId?: string;
}

export default function JobPostingForm({ 
  lang, 
  initialData, 
  isEditing = false, 
  jobId 
}: JobPostingFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isDraft, setIsDraft] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState('');

  // Dynamic arrays for requirements, responsibilities, skills, benefits
  const [requirements, setRequirements] = useState<string[]>(initialData?.requirements || ['']);
  const [responsibilities, setResponsibilities] = useState<string[]>(initialData?.responsibilities || ['']);
  const [requiredSkills, setRequiredSkills] = useState<string[]>(initialData?.requiredSkills || ['']);
  const [preferredSkills, setPreferredSkills] = useState<string[]>(initialData?.preferredSkills || ['']);
  const [benefits, setBenefits] = useState<string[]>(initialData?.benefits || ['']);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    getValues,
  } = useForm<JobPostingFormData>({
    resolver: zodResolver(jobPostingSchema),
    defaultValues: {
      ...initialData,
      company: {
        name: '',
        description: '',
        website: '',
        ...initialData?.company,
      },
      location: {
        city: '',
        state: '',
        country: '',
        remote: false,
        ...initialData?.location,
      },
      salary: {
        min: 0,
        max: 0,
        currency: 'USD',
        period: 'yearly',
        ...initialData?.salary,
      },
      jobType: initialData?.jobType || 'full-time',
      experienceLevel: initialData?.experienceLevel || 'mid',
    },
  });

  const watchedValues = watch();

  // Helper functions for dynamic arrays
  const addArrayItem = (
    array: string[], 
    setArray: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setArray([...array, '']);
  };

  const removeArrayItem = (
    index: number, 
    array: string[], 
    setArray: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    if (array.length > 1) {
      setArray(array.filter((_, i) => i !== index));
    }
  };

  const updateArrayItem = (
    index: number, 
    value: string, 
    array: string[], 
    setArray: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    const newArray = [...array];
    newArray[index] = value;
    setArray(newArray);
  };

  const onSubmit = async (data: JobPostingFormData, saveAsDraft = false) => {
    setIsLoading(true);
    setError('');

    try {
      // Update form data with dynamic arrays
      const formData = {
        ...data,
        requirements: requirements.filter(req => req.trim() !== ''),
        responsibilities: responsibilities.filter(resp => resp.trim() !== ''),
        requiredSkills: requiredSkills.filter(skill => skill.trim() !== ''),
        preferredSkills: preferredSkills.filter(skill => skill.trim() !== ''),
        benefits: benefits.filter(benefit => benefit.trim() !== ''),
        isActive: !saveAsDraft,
        isDraft: saveAsDraft,
      };

      const url = isEditing ? `/api/jobs/${jobId}` : '/api/jobs';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save job');
      }

      const result = await response.json();
      
      if (saveAsDraft) {
        setIsDraft(true);
        // Show success message for draft
      } else {
        // Redirect to job listing or job detail page
        router.push(`/${lang}/employer/jobs`);
      }

    } catch (error: any) {
      console.error('Job posting error:', error);
      setError(error.message || 'Failed to save job posting');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAsDraft = () => {
    const formData = getValues();
    onSubmit(formData, true);
  };

  if (showPreview) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Job Preview</h2>
          <Button
            onClick={() => setShowPreview(false)}
            variant="outline"
          >
            <X className="h-4 w-4 mr-2" />
            Close Preview
          </Button>
        </div>
        
        {/* Job Preview Content */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{watchedValues.title}</h1>
            <div className="flex items-center space-x-4 text-gray-600">
              <span className="flex items-center">
                <Briefcase className="h-4 w-4 mr-1" />
                {watchedValues.company?.name}
              </span>
              <span className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                {watchedValues.location?.city}, {watchedValues.location?.country}
                {watchedValues.location?.remote && ' (Remote)'}
              </span>
              <span className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {watchedValues.jobType}
              </span>
            </div>
          </div>

          <div className="prose max-w-none">
            <h3>Job Description</h3>
            <p>{watchedValues.description}</p>

            <h3>Requirements</h3>
            <ul>
              {requirements.filter(req => req.trim()).map((req, index) => (
                <li key={index}>{req}</li>
              ))}
            </ul>

            <h3>Responsibilities</h3>
            <ul>
              {responsibilities.filter(resp => resp.trim()).map((resp, index) => (
                <li key={index}>{resp}</li>
              ))}
            </ul>

            <h3>Required Skills</h3>
            <div className="flex flex-wrap gap-2">
              {requiredSkills.filter(skill => skill.trim()).map((skill, index) => (
                <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {skill}
                </span>
              ))}
            </div>

            {preferredSkills.filter(skill => skill.trim()).length > 0 && (
              <>
                <h3>Preferred Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {preferredSkills.filter(skill => skill.trim()).map((skill, index) => (
                    <span key={index} className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </>
            )}

            {benefits.filter(benefit => benefit.trim()).length > 0 && (
              <>
                <h3>Benefits</h3>
                <ul>
                  {benefits.filter(benefit => benefit.trim()).map((benefit, index) => (
                    <li key={index}>{benefit}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Edit Job Posting' : 'Create New Job Posting'}
        </h2>
        <p className="text-gray-600 mt-2">
          Fill in the details below to {isEditing ? 'update' : 'create'} your job posting.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {isDraft && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-600">Job saved as draft successfully!</p>
        </div>
      )}

      <form onSubmit={handleSubmit((data) => onSubmit(data, false))} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <Label htmlFor="title">Job Title *</Label>
              <Input
                id="title"
                placeholder="e.g. Senior Software Engineer"
                error={!!errors.title}
                {...register('title')}
              />
              {errors.title && (
                <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="jobType">Job Type *</Label>
              <Select
                id="jobType"
                error={!!errors.jobType}
                {...register('jobType')}
              >
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="freelance">Freelance</option>
                <option value="internship">Internship</option>
              </Select>
              {errors.jobType && (
                <p className="text-sm text-red-600 mt-1">{errors.jobType.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="experienceLevel">Experience Level *</Label>
              <Select
                id="experienceLevel"
                error={!!errors.experienceLevel}
                {...register('experienceLevel')}
              >
                <option value="entry">Entry Level</option>
                <option value="mid">Mid Level</option>
                <option value="senior">Senior Level</option>
                <option value="executive">Executive</option>
              </Select>
              {errors.experienceLevel && (
                <p className="text-sm text-red-600 mt-1">{errors.experienceLevel.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="description">Job Description *</Label>
              <Textarea
                id="description"
                rows={6}
                placeholder="Describe the role, what the candidate will be doing, and what makes this opportunity exciting..."
                error={!!errors.description}
                {...register('description')}
              />
              {errors.description && (
                <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Company Information */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="company.name">Company Name *</Label>
              <Input
                id="company.name"
                placeholder="Your company name"
                error={!!errors.company?.name}
                {...register('company.name')}
              />
              {errors.company?.name && (
                <p className="text-sm text-red-600 mt-1">{errors.company.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="company.website">Company Website</Label>
              <Input
                id="company.website"
                type="url"
                placeholder="https://yourcompany.com"
                error={!!errors.company?.website}
                {...register('company.website')}
              />
              {errors.company?.website && (
                <p className="text-sm text-red-600 mt-1">{errors.company.website.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="company.description">Company Description</Label>
              <Textarea
                id="company.description"
                rows={3}
                placeholder="Brief description of your company..."
                error={!!errors.company?.description}
                {...register('company.description')}
              />
              {errors.company?.description && (
                <p className="text-sm text-red-600 mt-1">{errors.company.description.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Location & Remote */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Location</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label htmlFor="location.city">City *</Label>
              <Input
                id="location.city"
                placeholder="e.g. New York"
                error={!!errors.location?.city}
                {...register('location.city')}
              />
              {errors.location?.city && (
                <p className="text-sm text-red-600 mt-1">{errors.location.city.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="location.state">State/Province</Label>
              <Input
                id="location.state"
                placeholder="e.g. NY"
                error={!!errors.location?.state}
                {...register('location.state')}
              />
            </div>

            <div>
              <Label htmlFor="location.country">Country *</Label>
              <Input
                id="location.country"
                placeholder="e.g. United States"
                error={!!errors.location?.country}
                {...register('location.country')}
              />
              {errors.location?.country && (
                <p className="text-sm text-red-600 mt-1">{errors.location.country.message}</p>
              )}
            </div>

            <div className="md:col-span-3">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="location.remote"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  {...register('location.remote')}
                />
                <Label htmlFor="location.remote">This is a remote position</Label>
              </div>
            </div>
          </div>
        </div>

        {/* Salary Information */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Salary Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <Label htmlFor="salary.min">Minimum Salary *</Label>
              <Input
                id="salary.min"
                type="number"
                placeholder="50000"
                error={!!errors.salary?.min}
                {...register('salary.min', { valueAsNumber: true })}
              />
              {errors.salary?.min && (
                <p className="text-sm text-red-600 mt-1">{errors.salary.min.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="salary.max">Maximum Salary *</Label>
              <Input
                id="salary.max"
                type="number"
                placeholder="80000"
                error={!!errors.salary?.max}
                {...register('salary.max', { valueAsNumber: true })}
              />
              {errors.salary?.max && (
                <p className="text-sm text-red-600 mt-1">{errors.salary.max.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="salary.currency">Currency</Label>
              <Select
                id="salary.currency"
                {...register('salary.currency')}
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="CAD">CAD</option>
                <option value="AUD">AUD</option>
              </Select>
            </div>

            <div>
              <Label htmlFor="salary.period">Period</Label>
              <Select
                id="salary.period"
                {...register('salary.period')}
              >
                <option value="yearly">Yearly</option>
                <option value="monthly">Monthly</option>
                <option value="hourly">Hourly</option>
              </Select>
            </div>
          </div>
        </div>

        {/* Requirements */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Requirements *</h3>
          
          <div className="space-y-3">
            {requirements.map((requirement, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Input
                  placeholder={`Requirement ${index + 1}`}
                  value={requirement}
                  onChange={(e) => updateArrayItem(index, e.target.value, requirements, setRequirements)}
                />
                {requirements.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeArrayItem(index, requirements, setRequirements)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => addArrayItem(requirements, setRequirements)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Requirement
            </Button>
          </div>
        </div>

        {/* Responsibilities */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Responsibilities *</h3>
          
          <div className="space-y-3">
            {responsibilities.map((responsibility, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Input
                  placeholder={`Responsibility ${index + 1}`}
                  value={responsibility}
                  onChange={(e) => updateArrayItem(index, e.target.value, responsibilities, setResponsibilities)}
                />
                {responsibilities.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeArrayItem(index, responsibilities, setResponsibilities)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => addArrayItem(responsibilities, setResponsibilities)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Responsibility
            </Button>
          </div>
        </div>

        {/* Skills */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills</h3>
          
          <div className="space-y-6">
            {/* Required Skills */}
            <div>
              <Label className="text-base font-medium">Required Skills *</Label>
              <div className="space-y-3 mt-2">
                {requiredSkills.map((skill, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      placeholder={`Required skill ${index + 1}`}
                      value={skill}
                      onChange={(e) => updateArrayItem(index, e.target.value, requiredSkills, setRequiredSkills)}
                    />
                    {requiredSkills.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeArrayItem(index, requiredSkills, setRequiredSkills)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addArrayItem(requiredSkills, setRequiredSkills)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Required Skill
                </Button>
              </div>
            </div>

            {/* Preferred Skills */}
            <div>
              <Label className="text-base font-medium">Preferred Skills</Label>
              <div className="space-y-3 mt-2">
                {preferredSkills.map((skill, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      placeholder={`Preferred skill ${index + 1}`}
                      value={skill}
                      onChange={(e) => updateArrayItem(index, e.target.value, preferredSkills, setPreferredSkills)}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeArrayItem(index, preferredSkills, setPreferredSkills)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addArrayItem(preferredSkills, setPreferredSkills)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Preferred Skill
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Benefits</h3>
          
          <div className="space-y-3">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Input
                  placeholder={`Benefit ${index + 1}`}
                  value={benefit}
                  onChange={(e) => updateArrayItem(index, e.target.value, benefits, setBenefits)}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeArrayItem(index, benefits, setBenefits)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => addArrayItem(benefits, setBenefits)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Benefit
            </Button>
          </div>
        </div>

        {/* Application Deadline */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Deadline</h3>
          
          <div>
            <Label htmlFor="applicationDeadline">Deadline (Optional)</Label>
            <Input
              id="applicationDeadline"
              type="date"
              {...register('applicationDeadline')}
            />
            <p className="text-sm text-gray-500 mt-1">
              Leave empty if there's no specific deadline
            </p>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-between space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowPreview(true)}
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>

          <div className="flex items-center space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleSaveAsDraft}
              disabled={isLoading}
            >
              <Save className="h-4 w-4 mr-2" />
              Save as Draft
            </Button>

            <Button
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Publishing...' : isEditing ? 'Update Job' : 'Publish Job'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}