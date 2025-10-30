<?php

namespace App\Http\Requests\Settings;

use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProfileUpdateRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => [
                'required',
                'string',
                'max:255',
                'regex:/^[a-zA-Z\s]+$/', // Only letters and spaces allowed
            ],

            'email' => [
                'required',
                'string',
                'lowercase',
                'email',
                'max:255',
                Rule::unique(User::class)->ignore($this->user()->id),
            ],

            'profile_picture' => [
                'nullable',
                'image',
                'mimes:jpeg,png,jpg', // Only PNG and JPEG allowed
                'max:2048', // 2MB max
                'dimensions:min_width=100,min_height=100,max_width=5000,max_height=5000',
            ],
        ];
    }

    /**
     * Get custom error messages for validation rules.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.regex' => 'The name field must contain only letters and spaces.',
            'profile_picture.mimes' => 'The profile picture must be a PNG or JPEG image file.',
            'profile_picture.image' => 'The profile picture must be a valid image file.',
            'profile_picture.dimensions' => 'The profile picture must be at least 100x100 pixels and not exceed 5000x5000 pixels.',
            'profile_picture.max' => 'The profile picture must not exceed 2MB.',
        ];
    }
}
