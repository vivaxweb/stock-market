import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, StyleSheet, Platform, Alert } from 'react-native';
import { useTrading } from '../context/TradingContext';

interface Lesson {
  id: string;
  title: string;
  content: string;
  quiz: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
  rewardCash: number;
  rewardXp: number;
}

interface Track {
  id: string;
  title: string;
  icon: string;
  description: string;
  lessons: Lesson[];
}

interface AcademyModalProps {
  visible: boolean;
  onClose: () => void;
}

export const AcademyModal: React.FC<AcademyModalProps> = ({ visible, onClose }) => {
  const { activeMarket } = useTrading();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);

  const HTTP_URL = 'http://localhost:8080';
  const isGlobal = activeMarket === 'GLOBAL';
  const currencySymbol = isGlobal ? '$' : '₹';

  useEffect(() => {
    if (visible) {
      fetchTracks();
    }
  }, [visible]);

  const fetchTracks = async () => {
    try {
      const res = await fetch(`${HTTP_URL}/api/academy`);
      const data = await res.json();
      if (data.tracks) {
        setTracks(data.tracks);
        if (!selectedTrack) {
          setSelectedTrack(data.tracks[0]);
        }
      }
    } catch (e) {
      console.error('Failed to load academy tracks', e);
    }
  };

  const handleSelectLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setSelectedAnswer(null);
    setQuizSubmitted(false);
  };

  const handleAnswerSubmit = () => {
    if (selectedAnswer === null || !selectedLesson) return;
    setQuizSubmitted(true);

    const isCorrect = selectedAnswer === selectedLesson.quiz.correctIndex;
    if (isCorrect) {
      if (!completedLessonIds.includes(selectedLesson.id)) {
        setCompletedLessonIds(prev => [...prev, selectedLesson.id]);
        const msg = `Correct! You earned +${currencySymbol}${selectedLesson.rewardCash.toLocaleString()} Cash and +${selectedLesson.rewardXp} XP!`;
        if (Platform.OS === 'web') alert(msg);
        else Alert.alert('Lesson Complete!', msg);
      }
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <View style={styles.titleRow}>
                <Text style={styles.title}>Bull Academy</Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>Learn & Earn</Text>
                </View>
              </View>
              <Text style={styles.subTitle}>
                Master professional trading concepts & earn virtual cash rewards
              </Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* If viewing a specific lesson */}
          {selectedLesson ? (
            <ScrollView style={styles.lessonDetail} showsVerticalScrollIndicator={false}>
              <TouchableOpacity style={styles.backBtn} onPress={() => setSelectedLesson(null)}>
                <Text style={styles.backBtnText}>← Back to Lessons</Text>
              </TouchableOpacity>

              <Text style={styles.lessonTitle}>{selectedLesson.title}</Text>
              <View style={styles.rewardPills}>
                <Text style={styles.rewardPillText}>+{currencySymbol}{selectedLesson.rewardCash.toLocaleString()} Cash</Text>
                <Text style={styles.rewardPillText}>+{selectedLesson.rewardXp} XP</Text>
              </View>

              <Text style={styles.lessonBody}>{selectedLesson.content}</Text>

              {/* Interactive Quiz Box */}
              <View style={styles.quizBox}>
                <Text style={styles.quizHeader}>Knowledge Check</Text>
                <Text style={styles.quizQuestion}>{selectedLesson.quiz.question}</Text>

                {selectedLesson.quiz.options.map((option, idx) => {
                  const isSelected = selectedAnswer === idx;
                  const isCorrect = idx === selectedLesson.quiz.correctIndex;
                  let optStyle = styles.quizOption;

                  if (quizSubmitted) {
                    if (isCorrect) optStyle = styles.quizOptionCorrect;
                    else if (isSelected && !isCorrect) optStyle = styles.quizOptionWrong;
                  } else if (isSelected) {
                    optStyle = styles.quizOptionSelected;
                  }

                  return (
                    <TouchableOpacity
                      key={idx}
                      style={[styles.optionBase, optStyle]}
                      disabled={quizSubmitted}
                      onPress={() => setSelectedAnswer(idx)}
                    >
                      <Text style={styles.optionNumber}>{String.fromCharCode(65 + idx)}</Text>
                      <Text style={styles.optionLabel}>{option}</Text>
                    </TouchableOpacity>
                  );
                })}

                {!quizSubmitted ? (
                  <TouchableOpacity
                    style={[styles.submitBtn, selectedAnswer === null && styles.submitBtnDisabled]}
                    disabled={selectedAnswer === null}
                    onPress={handleAnswerSubmit}
                  >
                    <Text style={styles.submitBtnText}>Submit Answer</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.explanationBox}>
                    <Text style={styles.explanationTitle}>
                      {selectedAnswer === selectedLesson.quiz.correctIndex ? 'Correct!' : 'Incorrect'}
                    </Text>
                    <Text style={styles.explanationText}>{selectedLesson.quiz.explanation}</Text>
                  </View>
                )}
              </View>
            </ScrollView>
          ) : (
            <View style={styles.mainView}>
              {/* Tracks Horizontal Selector */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.trackScroll}>
                {tracks.map(t => (
                  <TouchableOpacity
                    key={t.id}
                    style={[styles.trackTab, selectedTrack?.id === t.id && styles.trackTabActive]}
                    onPress={() => setSelectedTrack(t)}
                  >
                    <Text style={styles.trackIcon}>{t.icon}</Text>
                    <Text style={[styles.trackTabTitle, selectedTrack?.id === t.id && styles.textWhite]}>
                      {t.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Selected Track Lessons List */}
              <ScrollView style={styles.lessonsList} showsVerticalScrollIndicator={false}>
                <Text style={styles.trackDesc}>{selectedTrack?.description}</Text>

                {selectedTrack?.lessons.map((lesson, idx) => {
                  const isCompleted = completedLessonIds.includes(lesson.id);

                  return (
                    <TouchableOpacity
                      key={lesson.id}
                      style={[styles.lessonCard, isCompleted && styles.lessonCardCompleted]}
                      onPress={() => handleSelectLesson(lesson)}
                    >
                      <View style={styles.lessonNumCircle}>
                        <Text style={styles.lessonNumText}>{isCompleted ? '✓' : idx + 1}</Text>
                      </View>
                      <View style={styles.lessonInfo}>
                        <Text style={styles.lessonCardTitle}>{lesson.title}</Text>
                        <View style={styles.lessonRewardsRow}>
                          <Text style={styles.lessonRewardItem}>+{currencySymbol}{lesson.rewardCash.toLocaleString()}</Text>
                          <Text style={styles.lessonRewardItem}>+{lesson.rewardXp} XP</Text>
                        </View>
                      </View>
                      <Text style={styles.chevron}>→</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: '#0F172A',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    height: '85%',
    padding: 16,
    borderWidth: 1,
    borderColor: '#1E293B'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  title: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '800'
  },
  badge: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#334155'
  },
  badgeText: {
    color: '#34D399',
    fontSize: 10,
    fontWeight: '700'
  },
  subTitle: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2
  },
  closeBtn: {
    padding: 8
  },
  closeBtnText: {
    color: '#64748B',
    fontSize: 16,
    fontWeight: '700'
  },
  mainView: {
    flex: 1
  },
  trackScroll: {
    maxHeight: 50,
    marginBottom: 12
  },
  trackTab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
    gap: 6
  },
  trackTabActive: {
    backgroundColor: '#3B82F6'
  },
  trackIcon: {
    fontSize: 14
  },
  trackTabTitle: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700'
  },
  textWhite: {
    color: '#FFFFFF'
  },
  trackDesc: {
    color: '#64748B',
    fontSize: 11,
    marginBottom: 12,
    fontStyle: 'italic'
  },
  lessonsList: {
    flex: 1
  },
  lessonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#334155'
  },
  lessonCardCompleted: {
    borderColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.08)'
  },
  lessonNumCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  lessonNumText: {
    color: '#F8FAFC',
    fontSize: 11,
    fontWeight: '700'
  },
  lessonInfo: {
    flex: 1
  },
  lessonCardTitle: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4
  },
  lessonRewardsRow: {
    flexDirection: 'row',
    gap: 8
  },
  lessonRewardItem: {
    color: '#34D399',
    fontSize: 10,
    fontWeight: '600'
  },
  chevron: {
    color: '#64748B',
    fontSize: 16
  },
  lessonDetail: {
    flex: 1
  },
  backBtn: {
    marginBottom: 12
  },
  backBtnText: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '700'
  },
  lessonTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6
  },
  rewardPills: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14
  },
  rewardPillText: {
    backgroundColor: '#1E293B',
    color: '#34D399',
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  lessonBody: {
    color: '#CBD5E1',
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 16
  },
  quizBox: {
    backgroundColor: '#070A11',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1E293B',
    marginBottom: 20
  },
  quizHeader: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 8
  },
  quizQuestion: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 12
  },
  optionBase: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#334155'
  },
  quizOption: {
    backgroundColor: '#1E293B'
  },
  quizOptionSelected: {
    backgroundColor: '#1E3A8A',
    borderColor: '#3B82F6'
  },
  quizOptionCorrect: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderColor: '#10B981'
  },
  quizOptionWrong: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderColor: '#EF4444'
  },
  optionNumber: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
    marginRight: 8
  },
  optionLabel: {
    color: '#F8FAFC',
    fontSize: 12,
    flex: 1
  },
  submitBtn: {
    backgroundColor: '#3B82F6',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 6
  },
  submitBtnDisabled: {
    backgroundColor: '#334155'
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700'
  },
  explanationBox: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#1E293B',
    borderRadius: 8
  },
  explanationTitle: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 4
  },
  explanationText: {
    color: '#94A3B8',
    fontSize: 11,
    lineHeight: 16
  }
});
