import 'package:flutter/material.dart';

/// A reusable debounced search bar with a clear button.
class SearchBarWidget extends StatefulWidget {
  final String hintText;
  final ValueChanged<String> onChanged;
  final ValueChanged<String>? onSubmitted;
  final Duration debounce;
  final TextEditingController? controller;

  const SearchBarWidget({
    super.key,
    this.hintText = 'Search...',
    required this.onChanged,
    this.onSubmitted,
    this.debounce = const Duration(milliseconds: 400),
    this.controller,
  });

  @override
  State<SearchBarWidget> createState() => _SearchBarWidgetState();
}

class _SearchBarWidgetState extends State<SearchBarWidget> {
  late final TextEditingController _controller;
  String _lastValue = '';

  @override
  void initState() {
    super.initState();
    _controller = widget.controller ?? TextEditingController();
  }

  @override
  void dispose() {
    if (widget.controller == null) _controller.dispose();
    super.dispose();
  }

  void _onChanged(String value) {
    // Debounce
    Future.delayed(widget.debounce, () {
      if (value == _controller.text && value != _lastValue) {
        _lastValue = value;
        widget.onChanged(value);
      }
    });
  }

  void _clear() {
    _controller.clear();
    _lastValue = '';
    widget.onChanged('');
  }

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: _controller,
      onChanged: _onChanged,
      onSubmitted: widget.onSubmitted,
      decoration: InputDecoration(
        hintText: widget.hintText,
        prefixIcon: const Icon(Icons.search, size: 20),
        suffixIcon: _controller.text.isNotEmpty
            ? IconButton(
                icon: const Icon(Icons.clear, size: 18),
                onPressed: _clear,
              )
            : null,
        filled: true,
        fillColor: Theme.of(context).colorScheme.surfaceContainerHighest.withValues(alpha: 0.5),
        contentPadding: const EdgeInsets.symmetric(vertical: 0, horizontal: 16),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(24),
          borderSide: BorderSide.none,
        ),
      ),
    );
  }
}

/// A horizontal scrollable filter chip row.
class FilterChipsRow extends StatelessWidget {
  final List<String> options;
  final String? selected;
  final ValueChanged<String> onSelected;

  const FilterChipsRow({
    super.key,
    required this.options,
    required this.selected,
    required this.onSelected,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 40,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        itemCount: options.length,
        itemBuilder: (_, i) {
          final opt = options[i];
          final isSelected = opt == selected;
          return Padding(
            padding: EdgeInsets.only(right: 8, left: i == 0 ? 16 : 0),
            child: FilterChip(
              label: Text(opt),
              selected: isSelected,
              onSelected: (_) => onSelected(opt),
            ),
          );
        },
      ),
    );
  }
}
