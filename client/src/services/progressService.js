import axios from 'axios';

class ProgressService {
  constructor() {
    this.progressCache = new Map();
    this.listeners = new Set();
  }

  // Subscribe to progress updates
  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  // Notify all listeners of progress changes
  notifyListeners(data) {
    this.listeners.forEach(callback => callback(data));
  }

  // Update progress cache and notify listeners
  updateProgressCache(topicId, progressData) {
    this.progressCache.set(topicId, progressData);
    this.notifyListeners({ topicId, progress: progressData });
  }

  // Get cached progress for a topic
  getCachedProgress(topicId) {
    return this.progressCache.get(topicId);
  }

  // Update user progress when a problem is solved
  async updateProblemProgress(problemId, topicId, isCorrect, timeTaken) {
    try {
      const response = await axios.post('/api/dsa/progress/update', {
        problemId,
        topicId,
        isCorrect,
        timeTaken
      });

      if (response.data.success) {
        const updatedProgress = response.data.data.progress;
        this.updateProgressCache(topicId, updatedProgress);
        return updatedProgress;
      }
    } catch (error) {
      console.error('Error updating problem progress:', error);
      // Fallback: simulate progress update locally
      return this.simulateProgressUpdate(topicId, isCorrect);
    }
  }

  // Simulate progress update for offline/fallback mode
  simulateProgressUpdate(topicId, isCorrect) {
    const currentProgress = this.getCachedProgress(topicId) || {
      status: 'not_started',
      progressPercentage: 0,
      problemsAttempted: 0,
      problemsSolved: 0,
      timeSpent: 0
    };

    const updatedProgress = {
      ...currentProgress,
      status: currentProgress.status === 'not_started' ? 'in_progress' : currentProgress.status,
      problemsAttempted: currentProgress.problemsAttempted + 1,
      problemsSolved: isCorrect ? currentProgress.problemsSolved + 1 : currentProgress.problemsSolved,
      timeSpent: currentProgress.timeSpent + Math.floor(Math.random() * 10) + 5, // Random time 5-15 mins
    };

    // Calculate progress percentage
    updatedProgress.progressPercentage = Math.min(
      Math.round((updatedProgress.problemsSolved / Math.max(updatedProgress.problemsAttempted, 1)) * 100),
      100
    );

    // Update status based on progress
    if (updatedProgress.progressPercentage >= 100) {
      updatedProgress.status = 'completed';
    } else if (updatedProgress.progressPercentage >= 80) {
      updatedProgress.status = 'mastered';
    }

    this.updateProgressCache(topicId, updatedProgress);
    return updatedProgress;
  }

  // Fetch user progress for all topics
  async fetchAllProgress() {
    try {
      const response = await axios.get('/api/dsa/progress');
      if (response.data.success) {
        const progressData = response.data.data;
        
        // Update cache with fetched data
        if (progressData.topicProgress) {
          progressData.topicProgress.forEach(topicProgress => {
            this.updateProgressCache(topicProgress.topic._id || topicProgress.topic, {
              status: topicProgress.status || 'not_started',
              progressPercentage: topicProgress.progressPercentage || 0,
              problemsAttempted: topicProgress.problemsAttempted || 0,
              problemsSolved: topicProgress.problemsSolved || 0,
              timeSpent: topicProgress.timeSpent || 0
            });
          });
        }

        return progressData;
      }
    } catch (error) {
      console.error('Error fetching progress:', error);
      return this.getMockProgressData();
    }
  }

  // Get mock progress data for fallback
  getMockProgressData() {
    const mockTopics = ['arrays', 'linked-lists', 'stacks-queues', 'trees', 'graphs', 'dynamic-programming'];
    
    mockTopics.forEach(topicId => {
      if (!this.getCachedProgress(topicId)) {
        const randomProgress = Math.floor(Math.random() * 100);
        const mockProgress = {
          status: randomProgress === 0 ? 'not_started' : 
                  randomProgress < 30 ? 'in_progress' : 
                  randomProgress < 80 ? 'completed' : 'mastered',
          progressPercentage: randomProgress,
          problemsAttempted: Math.floor(randomProgress / 10),
          problemsSolved: Math.floor(randomProgress / 15),
          timeSpent: Math.floor(randomProgress * 2)
        };
        this.updateProgressCache(topicId, mockProgress);
      }
    });

    return {
      overallProgress: {
        percentage: 45,
        problemsSolved: 23,
        totalProblems: 50,
        timeSpent: 180
      },
      categoryProgress: [
        { _id: 'basic', averageProgress: 65, completedTopics: 2, totalTopics: 3 },
        { _id: 'intermediate', averageProgress: 35, completedTopics: 1, totalTopics: 2 },
        { _id: 'advanced', averageProgress: 15, completedTopics: 0, totalTopics: 1 }
      ],
      topicProgress: mockTopics.map(topicId => ({
        topic: { _id: topicId, name: topicId.charAt(0).toUpperCase() + topicId.slice(1) },
        ...this.getCachedProgress(topicId)
      }))
    };
  }

  // Update streak when user solves daily challenge
  async updateDailyStreak() {
    try {
      const response = await axios.post('/api/dsa/streak/update');
      return response.data;
    } catch (error) {
      console.error('Error updating streak:', error);
      return { streak: Math.floor(Math.random() * 10) + 1 };
    }
  }

  // Get user's current streak
  async getCurrentStreak() {
    try {
      const response = await axios.get('/api/dsa/streak');
      return response.data.data.streak || 0;
    } catch (error) {
      console.error('Error fetching streak:', error);
      return 0;
    }
  }
}

// Create singleton instance
const progressService = new ProgressService();

export default progressService;
