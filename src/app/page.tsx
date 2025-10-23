'use client'

import { useState, useCallback, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Calendar } from '@/components/ui/calendar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Upload, Camera, Leaf, AlertTriangle, CheckCircle, Droplets, Sun, Bug, 
  Heart, Star, TrendingUp, CalendarDays, Clock, Cloud, Wind, Thermometer,
  Users, MessageCircle, Share2, BookOpen, Sprout, Flower2, TreePine,
  Sparkles, Zap, Target, Award, Gift, Bell, Settings, Search, Filter,
  Plus, Minus, RotateCcw, Download, RefreshCw, ChevronRight, Info, Languages
} from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { format, addDays, startOfWeek } from 'date-fns'

// Multi-language support
const translations = {
  en: {
    title: "AI Plant Care Paradise",
    subtitle: "Your intelligent plant companion with disease detection, care reminders, weather insights, and a thriving community!",
    myPlants: "My Plants",
    tasksToday: "Tasks Today",
    healthScore: "Health Score",
    scans: "Scans",
    scanner: "Scanner",
    plants: "My Plants",
    calendar: "Calendar",
    weather: "Weather",
    database: "Database",
    community: "Community",
    aiPlantScanner: "AI Plant Scanner",
    uploadPhoto: "Upload a photo for instant AI analysis",
    dropImage: "Drop plant image here",
    selectDevice: "or click to select from your device",
    ready: "Ready",
    analyzePlant: "Analyze Plant Health",
    aiAnalyzing: "AI is Analyzing...",
    analysisResults: "Analysis Results",
    aiInsights: "AI-powered insights and recommendations",
    aiThinking: "AI is thinking...",
    readyToAnalyze: "Ready to analyze your plant!",
    uploadPhotoToSee: "Upload a photo to see AI-powered insights",
    addPlant: "Add Plant",
    plantName: "Plant name",
    selectPlantType: "Select plant type",
    location: "Location",
    notes: "Notes",
    careCalendar: "Care Calendar",
    todaysTasks: "Today's Tasks",
    currentWeather: "Current Weather",
    forecast: "5-Day Forecast",
    plantEncyclopedia: "Plant Encyclopedia",
    learnAboutPlants: "Learn about different plant species and their care requirements",
    plantCommunity: "Plant Community",
    connectWithEnthusiasts: "Connect with fellow plant enthusiasts",
    detectionHistory: "Detection History",
    recentAnalyses: "Your recent plant analyses",
    diseaseDetection: "Disease Detection",
    nutrientAnalysis: "Nutrient Analysis",
    weatherInsights: "Weather Insights",
    communityFeatures: "Community"
  },
  hi: {
    title: "एआई प्लांट केयर पैराडाइस",
    subtitle: "आपका इंटेलिजेंट प्लांट companion जो disease detection, care reminders, weather insights, और thriving community के साथ है!",
    myPlants: "मेरे पौधे",
    tasksToday: "आज के काम",
    healthScore: "हेल्थ स्कोर",
    scans: "स्कैन",
    scanner: "स्कैनर",
    plants: "मेरे पौधे",
    calendar: "कैलेंडर",
    weather: "मौसम",
    database: "डेटाबेस",
    community: "कम्युनिटी",
    aiPlantScanner: "एआई प्लांट स्कैनर",
    uploadPhoto: "तुरंत एआई analysis के लिए photo upload करें",
    dropImage: "प्लांट image यहाँ drop करें",
    selectDevice: "या device से select करने के लिए click करें",
    ready: "तैयार",
    analyzePlant: "प्लांट हेल्थ Analyze करें",
    aiAnalyzing: "एआई Analyze कर रहा है...",
    analysisResults: "Analysis Results",
    aiInsights: "एआई-powered insights और recommendations",
    aiThinking: "एआई सोच रहा है...",
    readyToAnalyze: "आपका प्लांट analyze करने के लिए तैयार!",
    uploadPhotoToSee: "एआई-powered insights देखने के लिए photo upload करें",
    addPlant: "प्लांट जोड़ें",
    plantName: "प्लांट का नाम",
    selectPlantType: "प्लांट type select करें",
    location: "जगह",
    notes: "नोट्स",
    careCalendar: "केयर कैलेंडर",
    todaysTasks: "आज के Tasks",
    currentWeather: "अभी का मौसम",
    forecast: "5-दिन का Forecast",
    plantEncyclopedia: "प्लांट एनसाइक्लोपीडिया",
    learnAboutPlants: "अलग-अलग प्लांट species और उनकी care requirements के बारे में जानें",
    plantCommunity: "प्लांट कम्युनिटी",
    connectWithEnthusiasts: "fellow plant enthusiasts के साथ connect करें",
    detectionHistory: "Detection History",
    recentAnalyses: "आपके recent प्लांट analyses",
    diseaseDetection: "डिजीज डिटेक्शन",
    nutrientAnalysis: "न्यूट्रिएंट एनालिसिस",
    weatherInsights: "मौसम Insights",
    communityFeatures: "कम्युनिटी"
  }
}

interface DetectionResult {
  plantName: string
  healthStatus: 'healthy' | 'disease' | 'nutrient-deficient'
  diseases: string[]
  nutrientDeficiencies: string[]
  confidence: number
  recommendations: string[]
  imageUrl: string
  timestamp: Date
}

interface Plant {
  id: string
  name: string
  type: string
  age: string
  location: string
  lastWatered: Date
  nextWatering: Date
  healthScore: number
  image?: string
  notes: string
}

interface CareTask {
  id: string
  plantId: string
  task: string
  dueDate: Date
  completed: boolean
  priority: 'low' | 'medium' | 'high'
}

interface WeatherData {
  temperature: number
  humidity: number
  windSpeed: number
  condition: string
  forecast: Array<{ day: string; high: number; low: number; condition: string }>
}

const plantDatabase = [
  { name: 'Monstera Deliciosa', type: 'Tropical', difficulty: 'Easy', waterFreq: 'Weekly', light: 'Indirect' },
  { name: 'Snake Plant', type: 'Succulent', difficulty: 'Easy', waterFreq: 'Bi-weekly', light: 'Low' },
  { name: 'Pothos', type: 'Tropical', difficulty: 'Easy', waterFreq: 'Weekly', light: 'Low to bright' },
  { name: 'Peace Lily', type: 'Flowering', difficulty: 'Medium', waterFreq: 'Twice weekly', light: 'Medium' },
  { name: 'Fiddle Leaf Fig', type: 'Tree', difficulty: 'Hard', waterFreq: 'Weekly', light: 'Bright' },
  { name: 'Rubber Plant', type: 'Tree', difficulty: 'Easy', waterFreq: 'Weekly', light: 'Bright' },
  { name: 'Spider Plant', type: 'Tropical', difficulty: 'Easy', waterFreq: 'Weekly', light: 'Medium' },
  { name: 'ZZ Plant', type: 'Succulent', difficulty: 'Easy', waterFreq: 'Bi-weekly', light: 'Low' }
]

export default function PlantDetectionSystem() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [detectionResult, setDetectionResult] = useState<DetectionResult | null>(null)
  const [history, setHistory] = useState<DetectionResult[]>([])
  const [myPlants, setMyPlants] = useState<Plant[]>([])
  const [careTasks, setCareTasks] = useState<CareTask[]>([])
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [showAddPlant, setShowAddPlant] = useState(false)
  const [newPlant, setNewPlant] = useState({ name: '', type: '', location: '', notes: '' })
  const [language, setLanguage] = useState<'en' | 'hi'>('en')
  const [notifications, setNotifications] = useState(true)

  const t = translations[language]

  useEffect(() => {
    // Fetch weather data
    fetchWeatherData()
    
    // Initialize sample data
    initializeSampleData()
  }, [])

  const fetchWeatherData = async () => {
    try {
      const response = await fetch('/api/weather')
      const data = await response.json()
      setWeather(data)
    } catch (error) {
      // Fallback weather data
      setWeather({
        temperature: 22,
        humidity: 65,
        windSpeed: 12,
        condition: 'Sunny',
        forecast: [
          { day: 'Mon', high: 24, low: 18, condition: 'Sunny' },
          { day: 'Tue', high: 22, low: 16, condition: 'Cloudy' },
          { day: 'Wed', high: 20, low: 14, condition: 'Rainy' },
          { day: 'Thu', high: 23, low: 17, condition: 'Sunny' },
          { day: 'Fri', high: 25, low: 19, condition: 'Sunny' }
        ]
      })
    }
  }

  const initializeSampleData = () => {
    setMyPlants([
      {
        id: '1',
        name: 'My Monstera',
        type: 'Monstera Deliciosa',
        age: '6 months',
        location: 'Living Room',
        lastWatered: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        nextWatering: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        healthScore: 85,
        notes: 'Growing new leaves!'
      },
      {
        id: '2',
        name: 'Kitchen Snake',
        type: 'Snake Plant',
        age: '1 year',
        location: 'Kitchen',
        lastWatered: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        nextWatering: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        healthScore: 92,
        notes: 'Very low maintenance'
      }
    ])

    setCareTasks([
      { id: '1', plantId: '1', task: 'Water Monstera', dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), completed: false, priority: 'high' },
      { id: '2', plantId: '2', task: 'Rotate Snake Plant', dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), completed: false, priority: 'medium' },
      { id: '3', plantId: '1', task: 'Fertilize Monstera', dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), completed: false, priority: 'low' }
    ])
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string)
        setDetectionResult(null)
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    multiple: false
  })

  const analyzePlant = async () => {
    if (!selectedImage) return

    setIsAnalyzing(true)
    try {
      const response = await fetch('/api/analyze-plant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrl: selectedImage })
      })

      const result = await response.json()
      const resultWithTimestamp = {
        ...result,
        timestamp: new Date()
      }
      setDetectionResult(resultWithTimestamp)
      setHistory(prev => [resultWithTimestamp, ...prev.slice(0, 9)])
    } catch (error) {
      console.error('Analysis failed:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const addPlant = () => {
    if (newPlant.name && newPlant.type) {
      const plant: Plant = {
        id: Date.now().toString(),
        name: newPlant.name,
        type: newPlant.type,
        age: 'New',
        location: newPlant.location,
        lastWatered: new Date(),
        nextWatering: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        healthScore: 100,
        notes: newPlant.notes
      }
      setMyPlants(prev => [...prev, plant])
      setNewPlant({ name: '', type: '', location: '', notes: '' })
      setShowAddPlant(false)
    }
  }

  const completeTask = (taskId: string) => {
    setCareTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, completed: true } : task
    ))
  }

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-gradient-to-r from-green-400 to-emerald-500'
      case 'disease': return 'bg-gradient-to-r from-red-400 to-pink-500'
      case 'nutrient-deficient': return 'bg-gradient-to-r from-yellow-400 to-orange-500'
      default: return 'bg-gradient-to-r from-gray-400 to-slate-500'
    }
  }

  const getHealthStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-5 h-5" />
      case 'disease': return <Bug className="w-5 h-5" />
      case 'nutrient-deficient': return <AlertTriangle className="w-5 h-5" />
      default: return <AlertTriangle className="w-5 h-5" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const filteredPlants = myPlants.filter(plant => 
    plant.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filterType === 'all' || plant.type.toLowerCase().includes(filterType.toLowerCase()))
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4">
        {/* Header with Language Toggle */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 pt-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div></div>
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="relative w-16 h-16"
              >
                <img
                  src="/logo.png"
                  alt="AI Plant Care Logo"
                  className="w-full h-full object-contain"
                />
              </motion.div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  🌿 {t.title}
                </h1>
                <p className="text-lg text-gray-600 max-w-2xl">
                  {t.subtitle}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
              className="flex items-center gap-2"
            >
              <Languages className="w-4 h-4" />
              {language === 'en' ? 'हिंदी' : 'English'}
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{t.myPlants}</p>
                  <p className="text-2xl font-bold text-gray-900">{myPlants.length}</p>
                </div>
                <Sprout className="w-8 h-8 text-green-500" />
              </div>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{t.tasksToday}</p>
                  <p className="text-2xl font-bold text-gray-900">{careTasks.filter(t => !t.completed).length}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-blue-500" />
              </div>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{t.healthScore}</p>
                  <p className="text-2xl font-bold text-gray-900">89%</p>
                </div>
                <Heart className="w-8 h-8 text-red-500" />
              </div>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{t.scans}</p>
                  <p className="text-2xl font-bold text-gray-900">{history.length}</p>
                </div>
                <Camera className="w-8 h-8 text-purple-500" />
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Main Navigation */}
        <Tabs defaultValue="detector" className="w-full">
          <TabsList className="grid w-full grid-cols-6 mb-8 bg-white shadow-sm border border-gray-200">
            <TabsTrigger value="detector" className="data-[state=active]:bg-green-50 data-[state=active]:text-green-700">
              <Camera className="w-4 h-4 mr-2" />
              {t.scanner}
            </TabsTrigger>
            <TabsTrigger value="plants" className="data-[state=active]:bg-green-50 data-[state=active]:text-green-700">
              <Leaf className="w-4 h-4 mr-2" />
              {t.plants}
            </TabsTrigger>
            <TabsTrigger value="calendar" className="data-[state=active]:bg-green-50 data-[state=active]:text-green-700">
              <CalendarDays className="w-4 h-4 mr-2" />
              {t.calendar}
            </TabsTrigger>
            <TabsTrigger value="weather" className="data-[state=active]:bg-green-50 data-[state=active]:text-green-700">
              <Cloud className="w-4 h-4 mr-2" />
              {t.weather}
            </TabsTrigger>
            <TabsTrigger value="database" className="data-[state=active]:bg-green-50 data-[state=active]:text-green-700">
              <BookOpen className="w-4 h-4 mr-2" />
              {t.database}
            </TabsTrigger>
            <TabsTrigger value="community" className="data-[state=active]:bg-green-50 data-[state=active]:text-green-700">
              <Users className="w-4 h-4 mr-2" />
              {t.community}
            </TabsTrigger>
          </TabsList>

          {/* Plant Scanner Tab */}
          <TabsContent value="detector">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Upload Section */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Card className="shadow-lg border-0">
                  <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-t-lg">
                    <CardTitle className="flex items-center gap-2">
                      <Camera className="w-5 h-5" />
                      🎯 {t.aiPlantScanner}
                    </CardTitle>
                    <CardDescription className="text-white/80">
                      {t.uploadPhoto}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div
                      {...getRootProps()}
                      className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                        isDragActive 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-gray-300 hover:border-green-400 bg-white'
                      }`}
                    >
                      <input {...getInputProps()} />
                      {selectedImage ? (
                        <div className="space-y-4">
                          <div className="relative w-full h-64 rounded-lg overflow-hidden">
                            <Image
                              src={selectedImage}
                              alt="Selected plant"
                              fill
                              className="object-cover"
                            />
                            <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs">
                              ✓ {t.ready}
                            </div>
                          </div>
                          <p className="text-sm text-gray-500">
                            {t.selectDevice}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <Upload className="w-16 h-16 text-green-400 mx-auto" />
                          </motion.div>
                          <div>
                            <p className="text-xl font-medium text-gray-700">
                              {isDragActive ? '🎯 Drop the image here!' : `📸 ${t.dropImage}`}
                            </p>
                            <p className="text-sm text-gray-500">
                              {t.selectDevice}
                            </p>
                          </div>
                          <div className="flex justify-center gap-2">
                            <Badge variant="secondary">JPEG</Badge>
                            <Badge variant="secondary">PNG</Badge>
                            <Badge variant="secondary">WebP</Badge>
                          </div>
                        </div>
                      )}
                    </div>

                    <Button
                      onClick={analyzePlant}
                      disabled={!selectedImage || isAnalyzing}
                      className="w-full mt-6 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3 text-lg shadow-lg"
                      size="lg"
                    >
                      {isAnalyzing ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          🤖 {t.aiAnalyzing}
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5 mr-2" />
                          ✨ {t.analyzePlant}
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Results Section */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Card className="shadow-lg border-0">
                  <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-t-lg">
                    <CardTitle className="flex items-center gap-2">
                      <Bug className="w-5 h-5" />
                      🔬 {t.analysisResults}
                    </CardTitle>
                    <CardDescription className="text-white/80">
                      {t.aiInsights}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <AnimatePresence mode="wait">
                      {isAnalyzing ? (
                        <motion.div
                          key="analyzing"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="space-y-6"
                        >
                          <div className="text-center py-8">
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                              className="w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"
                            ></motion.div>
                            <p className="text-xl font-medium text-gray-800">🧠 {t.aiThinking}</p>
                            <p className="text-sm text-gray-600">Analyzing plant health with advanced algorithms</p>
                            <div className="mt-4 space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Scanning for diseases...</span>
                                <span>✓</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span>Checking nutrients...</span>
                                <span>✓</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span>Generating recommendations...</span>
                                <span className="text-blue-600">⟳</span>
                              </div>
                            </div>
                          </div>
                          <Progress value={75} className="w-full h-2" />
                        </motion.div>
                      ) : detectionResult ? (
                        <motion.div
                          key="results"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className="space-y-6"
                        >
                          {/* Plant Name and Status */}
                          <div className="text-center">
                            <motion.div
                              initial={{ scale: 0.8 }}
                              animate={{ scale: 1 }}
                              className="inline-block"
                            >
                              <h3 className="text-3xl font-bold text-gray-900 mb-3">
                                🌱 {detectionResult.plantName}
                              </h3>
                            </motion.div>
                            <Badge
                              className={`${getHealthStatusColor(detectionResult.healthStatus)} text-white px-4 py-2 text-sm font-bold shadow-lg`}
                            >
                              <div className="flex items-center gap-2">
                                {getHealthStatusIcon(detectionResult.healthStatus)}
                                <span className="capitalize">{detectionResult.healthStatus.replace('-', ' ')}</span>
                              </div>
                            </Badge>
                            <div className="mt-3">
                              <span className="text-sm text-gray-500">AI Confidence: </span>
                              <span className="text-sm font-bold text-blue-600">{detectionResult.confidence}%</span>
                            </div>
                          </div>

                          {/* Diseases */}
                          {detectionResult.diseases.length > 0 && (
                            <motion.div
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.1 }}
                            >
                              <h4 className="font-bold text-red-600 mb-3 flex items-center gap-2">
                                <Bug className="w-5 h-5" />
                                🚨 Detected Diseases
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {detectionResult.diseases.map((disease, index) => (
                                  <motion.div
                                    key={index}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.1 + index * 0.1 }}
                                  >
                                    <Badge variant="destructive" className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1">
                                      {disease}
                                    </Badge>
                                  </motion.div>
                                ))}
                              </div>
                            </motion.div>
                          )}

                          {/* Nutrient Deficiencies */}
                          {detectionResult.nutrientDeficiencies.length > 0 && (
                            <motion.div
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.2 }}
                            >
                              <h4 className="font-bold text-yellow-600 mb-3 flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5" />
                                ⚠️ Nutrient Deficiencies
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {detectionResult.nutrientDeficiencies.map((deficiency, index) => (
                                  <motion.div
                                    key={index}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.2 + index * 0.1 }}
                                  >
                                    <Badge variant="secondary" className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-3 py-1">
                                      {deficiency}
                                    </Badge>
                                  </motion.div>
                                ))}
                              </div>
                            </motion.div>
                          )}

                          {/* Recommendations */}
                          {detectionResult.recommendations.length > 0 && (
                            <motion.div
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.3 }}
                            >
                              <h4 className="font-bold text-green-600 mb-3 flex items-center gap-2">
                                <CheckCircle className="w-5 h-5" />
                                💡 Care Recommendations
                              </h4>
                              <div className="space-y-2">
                                {detectionResult.recommendations.map((rec, index) => (
                                  <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 + index * 0.1 }}
                                    className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200"
                                  >
                                    <span className="text-green-500 mt-1 text-lg">✓</span>
                                    <span className="text-sm text-gray-700">{rec}</span>
                                  </motion.div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </motion.div>
                      ) : (
                        <motion.div
                          key="placeholder"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-center py-16 text-gray-500"
                        >
                          <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 3, repeat: Infinity }}
                          >
                            <Leaf className="w-24 h-24 mx-auto mb-6 text-gray-300" />
                          </motion.div>
                          <p className="text-xl font-medium mb-2">🌿 {t.readyToAnalyze}</p>
                          <p className="text-sm">{t.uploadPhotoToSee}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          {/* My Plants Tab */}
          <TabsContent value="plants">
            <div className="space-y-6">
              {/* Search and Filter */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="Search your plants..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Plants</SelectItem>
                    <SelectItem value="tropical">Tropical</SelectItem>
                    <SelectItem value="succulent">Succulent</SelectItem>
                    <SelectItem value="flowering">Flowering</SelectItem>
                  </SelectContent>
                </Select>
                <Dialog open={showAddPlant} onOpenChange={setShowAddPlant}>
                  <DialogTrigger asChild>
                    <Button className="bg-green-600 hover:bg-green-700 text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      {t.addPlant}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{t.addPlant}</DialogTitle>
                      <DialogDescription>
                        Add a new plant to your collection
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Input
                        placeholder={t.plantName}
                        value={newPlant.name}
                        onChange={(e) => setNewPlant({...newPlant, name: e.target.value})}
                      />
                      <Select value={newPlant.type} onValueChange={(value) => setNewPlant({...newPlant, type: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder={t.selectPlantType} />
                        </SelectTrigger>
                        <SelectContent>
                          {plantDatabase.map((plant) => (
                            <SelectItem key={plant.name} value={plant.name}>
                              {plant.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        placeholder={t.location}
                        value={newPlant.location}
                        onChange={(e) => setNewPlant({...newPlant, location: e.target.value})}
                      />
                      <Textarea
                        placeholder={t.notes}
                        value={newPlant.notes}
                        onChange={(e) => setNewPlant({...newPlant, notes: e.target.value})}
                      />
                      <Button onClick={addPlant} className="w-full">
                        {t.addPlant}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Plants Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPlants.map((plant) => (
                  <motion.div
                    key={plant.id}
                    whileHover={{ scale: 1.02 }}
                    className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200"
                  >
                    <div className="h-32 bg-gradient-to-br from-green-400 to-emerald-500 relative">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Leaf className="w-16 h-16 text-white/50" />
                      </div>
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-white/20 text-white">
                          {plant.healthScore}% Healthy
                        </Badge>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-lg mb-1">{plant.name}</h3>
                      <p className="text-sm text-gray-600 mb-3">{plant.type}</p>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Location:</span>
                          <span>{plant.location}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Next watering:</span>
                          <span>{format(plant.nextWatering, 'MMM dd')}</span>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-xs text-gray-500">{plant.notes}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Calendar Tab */}
          <TabsContent value="calendar">
            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarDays className="w-5 h-5" />
                    {t.careCalendar}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    className="rounded-md border"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    {t.todaysTasks}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {careTasks.filter(task => !task.completed).map((task) => (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="p-3 rounded-lg border bg-white"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{task.task}</p>
                            <p className="text-xs text-gray-500">
                              {format(task.dueDate, 'MMM dd, yyyy')}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getPriorityColor(task.priority)}>
                              {task.priority}
                            </Badge>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => completeTask(task.id)}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Weather Tab */}
          <TabsContent value="weather">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Cloud className="w-5 h-5" />
                    {t.currentWeather}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {weather && (
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-6xl mb-4">
                          {weather.condition === 'Sunny' && '☀️'}
                          {weather.condition === 'Cloudy' && '☁️'}
                          {weather.condition === 'Rainy' && '🌧️'}
                          {weather.condition === 'Windy' && '💨'}
                        </div>
                        <p className="text-3xl font-bold">{weather.temperature}°C</p>
                        <p className="text-gray-600">{weather.condition}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <Droplets className="w-6 h-6 text-blue-500 mx-auto mb-1" />
                          <p className="text-sm text-gray-600">Humidity</p>
                          <p className="font-bold">{weather.humidity}%</p>
                        </div>
                        <div className="text-center p-3 bg-teal-50 rounded-lg">
                          <Wind className="w-6 h-6 text-teal-500 mx-auto mb-1" />
                          <p className="text-sm text-gray-600">Wind</p>
                          <p className="font-bold">{weather.windSpeed} km/h</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t.forecast}</CardTitle>
                </CardHeader>
                <CardContent>
                  {weather && (
                    <div className="space-y-3">
                      {weather.forecast.map((day, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="font-medium">{day.day}</span>
                          <div className="flex items-center gap-2">
                            <span>
                              {day.condition === 'Sunny' && '☀️'}
                              {day.condition === 'Cloudy' && '☁️'}
                              {day.condition === 'Rainy' && '🌧️'}
                            </span>
                            <span className="text-sm text-gray-600">
                              {day.high}° / {day.low}°
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Plant Database Tab */}
          <TabsContent value="database">
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">🌿 {t.plantEncyclopedia}</h2>
                <p className="text-gray-600">{t.learnAboutPlants}</p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plantDatabase.map((plant, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200"
                  >
                    <div className="h-32 bg-gradient-to-br from-green-400 to-blue-500 relative">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Flower2 className="w-16 h-16 text-white/50" />
                      </div>
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-white/20 text-white">
                          {plant.difficulty}
                        </Badge>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-lg mb-2">{plant.name}</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Type:</span>
                          <span>{plant.type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Water:</span>
                          <span>{plant.waterFreq}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Light:</span>
                          <span>{plant.light}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Community Tab */}
          <TabsContent value="community">
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">🌍 {t.plantCommunity}</h2>
                <p className="text-gray-600">{t.connectWithEnthusiasts}</p>
              </div>
              <div className="grid lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Trending Plants
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {['Monstera', 'Snake Plant', 'Pothos'].map((plant, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="font-medium">{plant}</span>
                          <Badge variant="secondary">#{index + 1}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageCircle className="w-5 h-5" />
                      Recent Discussions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="font-medium text-sm">Help! Yellow leaves on monstera</p>
                        <p className="text-xs text-gray-500">12 replies • 2 hours ago</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="font-medium text-sm">Best fertilizer for tomatoes?</p>
                        <p className="text-xs text-gray-500">8 replies • 5 hours ago</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="w-5 h-5" />
                      Top Contributors
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {['PlantLover22', 'GreenThumb', 'BotanyBuddy'].map((user, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-400 rounded-full"></div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{user}</p>
                            <p className="text-xs text-gray-500">{100 - index * 20} points</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* History Section */}
        {history.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12"
          >
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  📜 {t.detectionHistory}
                </CardTitle>
                <CardDescription className="text-white/80">
                  {t.recentAnalyses}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {history.map((result, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      <div className="relative h-32">
                        <Image
                          src={result.imageUrl}
                          alt={result.plantName}
                          fill
                          className="object-cover"
                        />
                        <Badge
                          className={`absolute top-2 right-2 ${getHealthStatusColor(result.healthStatus)} text-white`}
                        >
                          {result.healthStatus}
                        </Badge>
                      </div>
                      <div className="p-3">
                        <h4 className="font-semibold text-sm">{result.plantName}</h4>
                        <p className="text-xs text-gray-500">
                          {format(result.timestamp, 'MMM dd, HH:mm')}
                        </p>
                        <p className="text-xs text-blue-600 font-medium">
                          {result.confidence}% confidence
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Features Section */}
        <div className="mt-16 grid md:grid-cols-4 gap-6">
          {[
            { icon: Bug, title: t.diseaseDetection, desc: 'AI identifies common plant diseases', color: 'from-red-400 to-pink-500' },
            { icon: Droplets, title: t.nutrientAnalysis, desc: 'Detects nutrient deficiencies', color: 'from-blue-400 to-cyan-500' },
            { icon: Sun, title: t.weatherInsights, desc: 'Personalized care based on weather', color: 'from-yellow-400 to-orange-500' },
            { icon: Users, title: t.communityFeatures, desc: 'Connect with plant lovers', color: 'from-purple-400 to-indigo-500' }
          ].map((feature, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-xl p-6 text-center shadow-lg border border-gray-200"
            >
              <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-600">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}