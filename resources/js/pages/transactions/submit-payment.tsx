import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  ArrowLeft, 
  Upload, 
  CreditCard, 
  Package,
  CheckCircle,
  AlertCircle,
  FileText
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';

interface Transaction {
  id: number;
  sale_price: number;
  commission_amount: number;
  seller_earnings: number;
  payment_method: string;
  product: {
    id: number;
    title: string;
    images: string[];
    price: number;
  };
  seller: {
    id: number;
    name: string;
  };
}

interface SubmitPaymentProps {
  transaction: Transaction;
}

export default function SubmitPayment({ transaction }: SubmitPaymentProps) {
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { data, setData, post, processing, errors } = useForm({
    platform_payment_reference: '',
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPaymentProof(file);
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('payment_proof', paymentProof!);
    formData.append('platform_payment_reference', data.platform_payment_reference);

    router.post(`/transactions/${transaction.id}/submit-payment`, formData, {
      forceFormData: true,
      onSuccess: () => {
        // Redirect will be handled by the controller
      }
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(price);
  };

  return (
    <AppLayout>
      <Head title="Submit Payment Proof" />
      
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/30 dark:to-green-800/20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-4 mb-4">
              <Link href={`/transactions/${transaction.id}`}>
                <Button variant="outline" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Transaction
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Submit Payment Proof
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Transaction #{transaction.id}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Transaction Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="mr-2 h-5 w-5" />
                  Transaction Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-4">
                  {transaction.product.images[0] && (
                    <img
                      src={transaction.product.images[0]}
                      alt={transaction.product.title}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{transaction.product.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Sold by: {transaction.seller.name}
                    </p>
                    <div className="mt-2 space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Sale Price:</span>
                        <span className="font-semibold">{formatPrice(transaction.sale_price)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Commission (2%):</span>
                        <span className="text-red-600">-{formatPrice(transaction.commission_amount)}</span>
                      </div>
                      <div className="flex justify-between border-t pt-1">
                        <span className="font-semibold">Amount to Pay:</span>
                        <span className="font-bold text-green-600">{formatPrice(transaction.sale_price)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

              {/* Platform Payment Instructions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="mr-2 h-5 w-5" />
                    Payment Instructions - Pay to Platform
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-green-900 dark:text-green-100">Pay to Restyle Platform</h4>
                          <p className="text-green-800 dark:text-green-200 text-sm mt-1">
                            Send payment to our platform account. We'll hold it securely in escrow until delivery is confirmed.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Platform Payment Details */}
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Platform Payment Details</h4>
                      
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">GCash</p>
                          <div className="bg-white dark:bg-gray-700 p-3 rounded border">
                            <p className="font-mono text-lg font-bold text-green-600">09123456789</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Restyle Platform</p>
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Bank Transfer (BPI)</p>
                          <div className="bg-white dark:bg-gray-700 p-3 rounded border">
                            <p className="font-mono text-lg font-bold text-blue-600">1234567890</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Restyle Platform</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-yellow-900 dark:text-yellow-100">How Escrow Works</h4>
                          <ul className="text-yellow-800 dark:text-yellow-200 text-sm mt-1 space-y-1">
                            <li>• You pay the full amount to Restyle Platform (₱{formatPrice(transaction.sale_price)})</li>
                            <li>• We hold your payment securely until you confirm delivery</li>
                            <li>• Seller receives 98% (₱{formatPrice(transaction.seller_earnings)}) after delivery</li>
                            <li>• Platform keeps 2% (₱{formatPrice(transaction.commission_amount)}) as service fee</li>
                            <li>• Your payment is protected - no risk of losing money</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

            {/* Payment Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Upload className="mr-2 h-5 w-5" />
                  Upload Payment Proof
                </CardTitle>
                <CardDescription>
                  Please upload a clear screenshot or photo of your payment confirmation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Platform Payment Reference */}
                  <div>
                    <Label htmlFor="platform_payment_reference">Payment Reference Number</Label>
                    <Input
                      id="platform_payment_reference"
                      type="text"
                      value={data.platform_payment_reference}
                      onChange={(e) => setData('platform_payment_reference', e.target.value)}
                      placeholder="Enter payment reference from GCash/Bank transfer"
                      className="mt-1"
                      required
                    />
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Enter the reference number from your GCash or bank transfer to Restyle Platform
                    </p>
                    {errors.platform_payment_reference && (
                      <p className="text-red-600 text-sm mt-1">{errors.platform_payment_reference}</p>
                    )}
                  </div>

                  {/* File Upload */}
                  <div>
                    <Label htmlFor="payment_proof">Payment Proof</Label>
                    <div className="mt-1">
                      <div className="flex items-center justify-center w-full">
                        <label
                          htmlFor="payment_proof"
                          className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600"
                        >
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-8 h-8 mb-4 text-gray-500" />
                            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                              <span className="font-semibold">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              PNG, JPG, GIF up to 2MB
                            </p>
                          </div>
                          <input
                            id="payment_proof"
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileChange}
                            required
                          />
                        </label>
                      </div>
                      
                      {previewUrl && (
                        <div className="mt-4">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Preview:
                          </p>
                          <img
                            src={previewUrl}
                            alt="Payment proof preview"
                            className="w-full max-w-md rounded-lg border"
                          />
                        </div>
                      )}
                    </div>
                    {errors.payment_proof && (
                      <p className="text-red-600 text-sm mt-1">{errors.payment_proof}</p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="flex space-x-3">
                    <Button
                      type="submit"
                      disabled={!paymentProof || processing}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    >
                      {processing ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Submit Payment Proof
                        </>
                      )}
                    </Button>
                    <Link href={`/transactions/${transaction.id}`}>
                      <Button type="button" variant="outline">
                        Cancel
                      </Button>
                    </Link>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Terms */}
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                  <p>
                    By submitting payment proof, you agree to our terms of service and understand that 
                    your payment will be held in escrow until delivery is confirmed.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
