"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  AlertTriangle, 
  Calendar, 
  Clock, 
  FileText, 
  Info, 
  MapPin, 
  Target, 
  Tag,
  Users,
  CheckCircle
} from "lucide-react";

interface IssueDescription {
  detailedDescription: string;
  category: string;
  severity: string;
  expectedResolution: string;
  additionalContext?: string;
}

interface IPFSDataDisplayProps {
  data: IssueDescription | any;
  title?: string;
  loading?: boolean;
}

export function IPFSDataDisplay({ data, title = "Project Details", loading = false }: IPFSDataDisplayProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>{title}</span>
          </CardTitle>
          <CardDescription>Loading detailed information from IPFS...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>{title}</span>
          </CardTitle>
          <CardDescription>No additional data available from IPFS</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Handle error cases
  if (data.error) {
    return (
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-amber-800">
            <AlertTriangle className="w-5 h-5" />
            <span>IPFS Data Error</span>
          </CardTitle>
          <CardDescription className="text-amber-700">
            Failed to retrieve data from IPFS: {data.error}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-amber-700">
          <div className="space-y-2 text-sm">
            <p><strong>Hash:</strong> <code className="bg-amber-100 px-1 rounded">{data.hash}</code></p>
            <p><strong>Timestamp:</strong> {data.timestamp}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Parse additional context if it's a JSON string
  let parsedContext = null;
  if (data.additionalContext) {
    try {
      parsedContext = typeof data.additionalContext === 'string' 
        ? JSON.parse(data.additionalContext) 
        : data.additionalContext;
    } catch (e) {
      // Keep as string if not valid JSON
    }
  }

  return (
    <div className="space-y-6">
      {/* Main Details Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <span>{title}</span>
          </CardTitle>
          <CardDescription>
            Enhanced project information stored on IPFS
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Project Overview */}
          {data.detailedDescription && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                <Info className="w-4 h-4 text-blue-500" />
                <span>What does this project do?</span>
              </h4>
              <div className="bg-blue-50 p-5 rounded-lg border border-blue-200">
                <p className="text-gray-800 leading-relaxed text-base">
                  {data.detailedDescription.length > 500 ? (
                    <>
                      {data.detailedDescription}
                      <br /><br />
                      <span className="text-sm text-blue-700 font-medium">
                        💡 This comprehensive description provides detailed insight into the project's goals and implementation strategy.
                      </span>
                    </>
                  ) : (
                    data.detailedDescription
                  )}
                </p>
              </div>
            </div>
          )}

          {/* Category and Severity */}
          <div className="grid md:grid-cols-2 gap-4">
            {data.category && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center space-x-2">
                  <Tag className="w-4 h-4 text-green-500" />
                  <span>Category</span>
                </h4>
                <Badge variant="outline" className="text-green-700 border-green-300">
                  {data.category}
                </Badge>
              </div>
            )}

            {data.severity && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                  <span>Priority Level</span>
                </h4>
                <Badge 
                  className={
                    data.severity.toLowerCase() === 'high' 
                      ? 'bg-red-500 text-white'
                      : data.severity.toLowerCase() === 'medium'
                      ? 'bg-orange-500 text-white'
                      : 'bg-green-500 text-white'
                  }
                >
                  {data.severity}
                </Badge>
              </div>
            )}
          </div>

          {/* Expected Resolution */}
          {data.expectedResolution && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center space-x-2">
                <Target className="w-4 h-4 text-purple-500" />
                <span>Expected Resolution</span>
              </h4>
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <p className="text-purple-900">{data.expectedResolution}</p>
              </div>
            </div>
          )}

          {/* Additional Context */}
          {data.additionalContext && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center space-x-2">
                <Users className="w-4 h-4 text-indigo-500" />
                <span>Additional Context</span>
              </h4>
              {parsedContext ? (
                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200 space-y-3">
                  {Object.entries(parsedContext).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-start">
                      <span className="font-medium text-indigo-700 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}:
                      </span>
                      <span className="text-indigo-900 text-right max-w-xs">
                        {Array.isArray(value) ? (
                          <div className="space-y-1">
                            {value.map((item: any, idx: number) => (
                              <div key={idx} className="text-sm bg-white p-2 rounded border">
                                {typeof item === 'object' ? (
                                  <div className="space-y-1">
                                    {Object.entries(item).map(([subKey, subValue]) => (
                                      <div key={subKey} className="text-xs">
                                        <strong className="text-indigo-600">{subKey}:</strong> {String(subValue)}
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  String(item)
                                )}
                              </div>
                            ))}
                          </div>
                        ) : typeof value === 'object' ? (
                          <div className="text-sm bg-white p-2 rounded border space-y-1">
                            {Object.entries(value as any).map(([subKey, subValue]) => (
                              <div key={subKey} className="text-xs">
                                <strong className="text-indigo-600">{subKey}:</strong> {String(subValue)}
                              </div>
                            ))}
                          </div>
                        ) : (
                          String(value)
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                  <p className="text-indigo-900">{data.additionalContext}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Metadata Card */}
      {parsedContext && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span>Project Metadata</span>
            </CardTitle>
            <CardDescription>
              Structured information extracted from IPFS data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Timeline Information */}
              {(parsedContext.duration || parsedContext.timeline || parsedContext.startDate || parsedContext.endDate) && (
                <div className="space-y-2">
                  <h5 className="font-semibold flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <span>Timeline</span>
                  </h5>
                  <div className="space-y-1 text-sm">
                    {parsedContext.duration && (
                      <p><span className="text-gray-600">Duration:</span> {parsedContext.duration}</p>
                    )}
                    {parsedContext.startDate && (
                      <p><span className="text-gray-600">Start:</span> {new Date(parsedContext.startDate).toLocaleDateString()}</p>
                    )}
                    {parsedContext.endDate && (
                      <p><span className="text-gray-600">End:</span> {new Date(parsedContext.endDate).toLocaleDateString()}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Location Information */}
              {(parsedContext.location || parsedContext.address || parsedContext.district) && (
                <div className="space-y-2">
                  <h5 className="font-semibold flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-red-500" />
                    <span>Location</span>
                  </h5>
                  <div className="space-y-1 text-sm">
                    {parsedContext.location && (
                      <p><span className="text-gray-600">Area:</span> {parsedContext.location}</p>
                    )}
                    {parsedContext.address && (
                      <p><span className="text-gray-600">Address:</span> {parsedContext.address}</p>
                    )}
                    {parsedContext.district && (
                      <p><span className="text-gray-600">District:</span> {parsedContext.district}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Ministry/Department Information */}
              {(parsedContext.ministry || parsedContext.department || parsedContext.governmentEntity) && (
                <div className="space-y-2">
                  <h5 className="font-semibold flex items-center space-x-2">
                    <Users className="w-4 h-4 text-purple-500" />
                    <span>Government</span>
                  </h5>
                  <div className="space-y-1 text-sm">
                    {parsedContext.ministry && (
                      <p><span className="text-gray-600">Ministry:</span> {parsedContext.ministry}</p>
                    )}
                    {parsedContext.department && (
                      <p><span className="text-gray-600">Department:</span> {parsedContext.department}</p>
                    )}
                    {parsedContext.governmentEntity && (
                      <p><span className="text-gray-600">Entity:</span> {parsedContext.governmentEntity}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default IPFSDataDisplay;