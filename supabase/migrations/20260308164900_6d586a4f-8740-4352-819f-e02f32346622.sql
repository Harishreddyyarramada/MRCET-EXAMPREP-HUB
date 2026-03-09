
-- Trigger function: auto-create notification when paper status changes
CREATE OR REPLACE FUNCTION public.notify_paper_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only fire when status actually changes to approved or rejected
  IF OLD.status IS DISTINCT FROM NEW.status AND NEW.status IN ('approved', 'rejected') THEN
    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (
      NEW.uploaded_by,
      CASE NEW.status
        WHEN 'approved' THEN 'Paper Approved ✅'
        WHEN 'rejected' THEN 'Paper Rejected ❌'
      END,
      CASE NEW.status
        WHEN 'approved' THEN 'Your paper "' || NEW.subject_name || '" (' || NEW.exam_type || ' - ' || NEW.branch || ') has been approved and is now publicly available.'
        WHEN 'rejected' THEN 'Your paper "' || NEW.subject_name || '" (' || NEW.exam_type || ' - ' || NEW.branch || ') was rejected.' || COALESCE(' Reason: ' || NEW.review_note, '')
      END,
      CASE NEW.status
        WHEN 'approved' THEN 'success'
        WHEN 'rejected' THEN 'error'
      END
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Attach trigger to papers table
CREATE TRIGGER on_paper_status_change
  AFTER UPDATE ON public.papers
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_paper_status_change();

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
