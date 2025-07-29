import { useState, useEffect, useCallback } from 'react';
import progressService from '../services/progressService';

export const useProgress = (topicId = null) => {
  const [progress, setProgress] = useState(null);
  const [allProgress, setAllProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Update progress for a specific topic
  const updateProgress = useCallback(async (problemId, isCorrect, timeTaken = 0) => {
    if (!topicId) return;
    
    try {
      const updatedProgress = await progressService.updateProblemProgress(
        problemId, 
        topicId, 
        isCorrect, 
        timeTaken
      );
      setProgress(updatedProgress);
      return updatedProgress;
    } catch (err) {
      setError(err.message);
      return null;
    }
  }, [topicId]);

  // Fetch all progress data
  const fetchAllProgress = useCallback(async () => {
    try {
      setLoading(true);
      const progressData = await progressService.fetchAllProgress();
      setAllProgress(progressData);
      
      // If we have a specific topicId, extract its progress
      if (topicId && progressData.topicProgress) {
        const topicProgress = progressData.topicProgress.find(
          tp => tp.topic._id === topicId || tp.topic === topicId
        );
        if (topicProgress) {
          setProgress({
            status: topicProgress.status,
            progressPercentage: topicProgress.progressPercentage,
            problemsAttempted: topicProgress.problemsAttempted,
            problemsSolved: topicProgress.problemsSolved,
            timeSpent: topicProgress.timeSpent
          });
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [topicId]);

  // Get cached progress for a topic
  const getCachedProgress = useCallback((targetTopicId) => {
    return progressService.getCachedProgress(targetTopicId || topicId);
  }, [topicId]);

  // Subscribe to progress updates
  useEffect(() => {
    const unsubscribe = progressService.subscribe((data) => {
      if (topicId && data.topicId === topicId) {
        setProgress(data.progress);
      }
      
      // Update all progress if it affects the overall data
      if (allProgress) {
        setAllProgress(prevAll => {
          if (!prevAll.topicProgress) return prevAll;
          
          const updatedTopicProgress = prevAll.topicProgress.map(tp => {
            if ((tp.topic._id || tp.topic) === data.topicId) {
              return {
                ...tp,
                ...data.progress
              };
            }
            return tp;
          });
          
          return {
            ...prevAll,
            topicProgress: updatedTopicProgress
          };
        });
      }
    });

    return unsubscribe;
  }, [topicId, allProgress]);

  // Initial data fetch
  useEffect(() => {
    fetchAllProgress();
  }, [fetchAllProgress]);

  // Get progress for a specific topic (useful for components that need multiple topics)
  const getTopicProgress = useCallback((targetTopicId) => {
    if (!allProgress?.topicProgress) return null;
    
    const topicProgress = allProgress.topicProgress.find(
      tp => tp.topic._id === targetTopicId || tp.topic === targetTopicId
    );
    
    return topicProgress ? {
      status: topicProgress.status,
      progressPercentage: topicProgress.progressPercentage,
      problemsAttempted: topicProgress.problemsAttempted,
      problemsSolved: topicProgress.problemsSolved,
      timeSpent: topicProgress.timeSpent
    } : null;
  }, [allProgress]);

  return {
    progress,
    allProgress,
    loading,
    error,
    updateProgress,
    fetchAllProgress,
    getCachedProgress,
    getTopicProgress
  };
};

// Hook specifically for overall progress data
export const useOverallProgress = () => {
  const { allProgress, loading, error, fetchAllProgress } = useProgress();
  
  return {
    overallProgress: allProgress?.overallProgress,
    categoryProgress: allProgress?.categoryProgress,
    topicProgress: allProgress?.topicProgress,
    loading,
    error,
    refresh: fetchAllProgress
  };
};

// Hook for daily streak management
export const useStreak = () => {
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  const updateStreak = useCallback(async () => {
    try {
      const result = await progressService.updateDailyStreak();
      setStreak(result.streak || 0);
      return result;
    } catch (error) {
      console.error('Error updating streak:', error);
      return null;
    }
  }, []);

  const fetchStreak = useCallback(async () => {
    try {
      setLoading(true);
      const currentStreak = await progressService.getCurrentStreak();
      setStreak(currentStreak);
    } catch (error) {
      console.error('Error fetching streak:', error);
      setStreak(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStreak();
  }, [fetchStreak]);

  return {
    streak,
    loading,
    updateStreak,
    refresh: fetchStreak
  };
};
